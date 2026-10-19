import pandas as pd
import numpy as np
import json
import math
from scipy import stats

# 1. Load Data
excel_path = '가상기업 3개 5개년매출데이터 (2).xlsx'
df_monthly = pd.read_excel(excel_path, sheet_name='월간매출')
df_yearly = pd.read_excel(excel_path, sheet_name='연간요약')

cols = df_monthly.columns
date_col = cols[0]
c_hanbit = cols[1]
c_mirae = cols[2]
c_saebom = cols[3]

dates = pd.to_datetime(df_monthly[date_col]).dt.strftime('%Y-%m').tolist()
h_sales = np.array(df_monthly[c_hanbit], dtype=float)
m_sales = np.array(df_monthly[c_mirae], dtype=float)
s_sales = np.array(df_monthly[c_saebom], dtype=float)

N = len(dates)

# Helper: Descriptive stats
def calc_desc_stats(arr):
    q25, q50, q75 = np.percentile(arr, [25, 50, 75])
    mean = float(np.mean(arr))
    std = float(np.std(arr, ddof=1))
    skew = float(stats.skew(arr))
    kurt = float(stats.kurtosis(arr))
    jb_stat, jb_p = stats.jarque_bera(arr)
    return {
        'mean': round(mean, 2),
        'std': round(std, 2),
        'median': round(float(q50), 2),
        'iqr': round(float(q75 - q25), 2),
        'q25': round(float(q25), 2),
        'q75': round(float(q75), 2),
        'min': round(float(np.min(arr)), 2),
        'max': round(float(np.max(arr)), 2),
        'cv': round(std / mean * 100, 2),
        'skew': round(skew, 2),
        'kurtosis': round(kurt, 2),
        'jb_p': round(float(jb_p), 4),
        'is_normal': bool(jb_p > 0.05)
    }

# Helper: Linear regression
def calc_linear_regression(arr):
    x = np.arange(len(arr))
    slope, intercept, r_val, p_val, std_err = stats.linregress(x, arr)
    line = [round(float(intercept + slope * i), 2) for i in range(len(arr))]
    return {
        'slope': round(float(slope), 4),
        'intercept': round(float(intercept), 2),
        'r2': round(float(r_val**2), 4),
        'p_value': round(float(p_val), 6),
        'line': line
    }

# Helper: Moving averages
def calc_ma(arr, window):
    res = []
    for i in range(len(arr)):
        if i < window - 1:
            res.append(None)
        else:
            res.append(round(float(np.mean(arr[i-window+1:i+1])), 2))
    return res

# Helper: EMA
def calc_ema(arr, span):
    res = []
    alpha = 2 / (span + 1)
    ema = arr[0]
    res.append(round(float(ema), 2))
    for v in arr[1:]:
        ema = alpha * v + (1 - alpha) * ema
        res.append(round(float(ema), 2))
    return res

# Helper: Additive Time-Series Decomposition (12M period)
def calc_decomposition(arr):
    trend = [None]*len(arr)
    for i in range(6, len(arr)-6):
        w = arr[i-6:i+7]
        v = (0.5*w[0] + np.sum(w[1:-1]) + 0.5*w[-1]) / 12.0
        trend[i] = round(float(v), 2)
    
    detrended = [arr[i] - trend[i] if trend[i] is not None else None for i in range(len(arr))]
    
    monthly_sum = [0.0]*12
    monthly_cnt = [0]*12
    for i in range(len(arr)):
        m = i % 12
        if detrended[i] is not None:
            monthly_sum[m] += detrended[i]
            monthly_cnt[m] += 1
    seasonal_factor = [monthly_sum[m]/monthly_cnt[m] for m in range(12)]
    s_mean = np.mean(seasonal_factor)
    seasonal_factor = [round(float(x - s_mean), 3) for x in seasonal_factor]
    
    seasonal = [seasonal_factor[i % 12] for i in range(len(arr))]
    
    valid_trend = [(i, trend[i]) for i in range(len(arr)) if trend[i] is not None]
    if valid_trend:
        x0, y0 = valid_trend[0]
        x1, y1 = valid_trend[1]
        slope_left = (y1 - y0)/(x1 - x0)
        for i in range(x0):
            trend[i] = round(float(y0 - slope_left*(x0 - i)), 2)
        xn_1, yn_1 = valid_trend[-2]
        xn, yn = valid_trend[-1]
        slope_right = (yn - yn_1)/(xn - xn_1)
        for i in range(xn+1, len(arr)):
            trend[i] = round(float(yn + slope_right*(i - xn)), 2)
            
    residual = []
    for i in range(len(arr)):
        if trend[i] is not None:
            residual.append(round(float(arr[i] - trend[i] - seasonal[i]), 2))
        else:
            residual.append(0.0)
            
    return {'trend': trend, 'seasonal': seasonal, 'residual': residual, 'seasonal_factor': seasonal_factor}

# Helper: HP filter (monthly lambda = 14400)
def calc_hp_filter(arr, lamb=14400):
    n = len(arr)
    I = np.eye(n)
    D = np.zeros((n-2, n))
    for i in range(n-2):
        D[i, i] = 1
        D[i, i+1] = -2
        D[i, i+2] = 1
    trend = np.linalg.solve(I + lamb * np.dot(D.T, D), arr)
    cycle = arr - trend
    return {
        'trend': [round(float(x), 2) for x in trend],
        'cycle': [round(float(x), 2) for x in cycle]
    }

# Helper: Seasonal Index (Base 100)
def calc_seasonal_index(arr):
    mean_val = np.mean(arr)
    m_means = [np.mean([arr[i] for i in range(len(arr)) if i % 12 == m]) for m in range(12)]
    return [round(float(m_m / mean_val * 100), 1) for m_m in m_means]

# Helper: ACF
def calc_acf(arr, max_lag=12):
    mean = np.mean(arr)
    var = np.var(arr)
    acfs = []
    n = len(arr)
    for lag in range(1, max_lag + 1):
        c = np.sum((arr[lag:] - mean) * (arr[:-lag] - mean)) / ((n - lag) * var)
        acfs.append(round(float(c), 3))
    ci = round(float(1.96 / np.sqrt(n)), 3)
    return {'lags': list(range(1, max_lag + 1)), 'values': acfs, 'ci': ci}

# Helper: MDD
def calc_mdd(arr):
    drawdowns = []
    peak = -math.inf
    for v in arr:
        if v > peak:
            peak = v
        dd = (v - peak) / peak * 100
        drawdowns.append(round(float(dd), 2))
    mdd = min(drawdowns)
    return {'drawdowns': drawdowns, 'mdd': round(float(mdd), 2)}

# Helper: Holt-Winters (Additive) forecast for 12 months (2026-01 to 2026-12)
def calc_holt_winters_forecast(arr, season_len=12, h=12):
    alpha, beta, gamma = 0.35, 0.05, 0.4
    L = np.mean(arr[:season_len])
    b = (np.mean(arr[season_len:2*season_len]) - np.mean(arr[:season_len])) / season_len
    s = [arr[i] - L for i in range(season_len)]
    
    for i in range(len(arr)):
        val = arr[i]
        last_L = L
        L = alpha * (val - s[i % season_len]) + (1 - alpha) * (L + b)
        b = beta * (L - last_L) + (1 - beta) * b
        s[i % season_len] = gamma * (val - L) + (1 - gamma) * s[i % season_len]
        
    forecast = []
    for m in range(1, h + 1):
        f = L + m * b + s[(len(arr) + m - 1) % season_len]
        forecast.append(round(float(f), 2))
        
    residuals = []
    for i in range(season_len, len(arr)):
        f_in = L + s[i % season_len]
        residuals.append(arr[i] - f_in)
    res_std = float(np.std(residuals))
    
    p10 = [round(float(f - 1.28 * res_std * np.sqrt(1 + m*0.08)), 2) for m, f in enumerate(forecast, 1)]
    p90 = [round(float(f + 1.28 * res_std * np.sqrt(1 + m*0.08)), 2) for m, f in enumerate(forecast, 1)]
    
    forecast_dates = [f'2026-{m:02d}' for m in range(1, 13)]
    return {
        'forecast_dates': forecast_dates,
        'forecast': forecast,
        'p10': p10,
        'p90': p90,
        'next_year_total': round(float(np.sum(forecast)), 2)
    }

# Process each company
companies_data = {}
color_map = {'한빛테크': '#3B82F6', '미래솔루션': '#10B981', '새봄산업': '#F59E0B'}
badge_type_map = {'한빛테크': '고성장형 (Scale-Up)', '미래솔루션': '안정성장형 (Steady Growth)', '새봄산업': '성숙/방어형 (Mature/Defensive)'}

for name, arr in [('한빛테크', h_sales), ('미래솔루션', m_sales), ('새봄산업', s_sales)]:
    stats_dict = calc_desc_stats(arr)
    reg_dict = calc_linear_regression(arr)
    decomp = calc_decomposition(arr)
    hp = calc_hp_filter(arr)
    s_idx = calc_seasonal_index(arr)
    acf = calc_acf(arr)
    mdd = calc_mdd(arr)
    hw = calc_holt_winters_forecast(arr)
    
    cagr_5y = round(float(((np.sum(arr[-12:]) / np.sum(arr[:12])) ** (1/4) - 1) * 100), 2)
    cum_sales = [round(float(x), 2) for x in np.cumsum(arr)]
    
    mean_val = stats_dict['mean']
    std_val = stats_dict['std']
    z_scores = [round(float((v - mean_val) / std_val), 2) for v in arr]
    outliers = [{'idx': i, 'date': dates[i], 'value': arr[i], 'z': z_scores[i]} for i in range(len(arr)) if abs(z_scores[i]) >= 1.96]
    
    sma3 = calc_ma(arr, 3)
    sma6 = calc_ma(arr, 6)
    sma12 = calc_ma(arr, 12)
    
    ema6 = calc_ema(arr, 6)
    ema12 = calc_ema(arr, 12)
    ema_spread = [round(e6 - e12, 2) for e6, e12 in zip(ema6, ema12)]
    
    base_val = arr[0]
    indexed = [round(float(v / base_val * 100), 1) for v in arr]
    
    downside_diff = [min(0, v - mean_val) for v in arr]
    downside_std = float(np.sqrt(np.mean(np.square(downside_diff))))
    sharpe_proxy = round(float((cagr_5y) / stats_dict['cv']), 2) if stats_dict['cv'] > 0 else 0
    
    yearly_sums = {}
    for i in range(len(arr)):
        yr = int(dates[i][:4])
        yearly_sums[yr] = yearly_sums.get(yr, 0.0) + arr[i]
    yearly_sums = {yr: round(val, 2) for yr, val in yearly_sums.items()}
    
    years = sorted(list(yearly_sums.keys()))
    yoy_rates = {}
    for i in range(1, len(years)):
        prev_y = years[i-1]
        curr_y = years[i]
        yoy_rates[curr_y] = round((yearly_sums[curr_y] / yearly_sums[prev_y] - 1) * 100, 2)
        
    quarterly_data = {}
    for i in range(len(arr)):
        yr = dates[i][:4]
        mo = int(dates[i][5:7])
        q = f'{yr}-Q{(mo-1)//3 + 1}'
        quarterly_data[q] = quarterly_data.get(q, 0.0) + arr[i]
    quarterly_data = {q: round(v, 2) for q, v in quarterly_data.items()}
    
    companies_data[name] = {
        'name': name,
        'badge_type': badge_type_map[name],
        'color': color_map[name],
        'raw_sales': [round(float(x), 2) for x in arr],
        'total_5y': round(float(np.sum(arr)), 2),
        'cagr_5y': cagr_5y,
        'stats': stats_dict,
        'regression': reg_dict,
        'decomposition': decomp,
        'hp_filter': hp,
        'seasonal_index': s_idx,
        'acf': acf,
        'mdd': mdd,
        'cum_sales': cum_sales,
        'z_scores': z_scores,
        'outliers': outliers,
        'sma3': sma3,
        'sma6': sma6,
        'sma12': sma12,
        'ema6': ema6,
        'ema12': ema12,
        'ema_spread': ema_spread,
        'indexed': indexed,
        'downside_std': round(downside_std, 2),
        'sharpe_proxy': sharpe_proxy,
        'yearly_sums': yearly_sums,
        'yoy_rates': yoy_rates,
        'quarterly_sums': quarterly_data,
        'forecast': hw
    }

# Market level
total_market_monthly = [round(float(h_sales[i] + m_sales[i] + s_sales[i]), 2) for i in range(N)]
share_hanbit = [round(h_sales[i] / total_market_monthly[i] * 100, 2) for i in range(N)]
share_mirae = [round(m_sales[i] / total_market_monthly[i] * 100, 2) for i in range(N)]
share_saebom = [round(s_sales[i] / total_market_monthly[i] * 100, 2) for i in range(N)]

hhi_monthly = [round(float((share_hanbit[i])**2 + (share_mirae[i])**2 + (share_saebom[i])**2), 1) for i in range(N)]

matrix_df = pd.DataFrame({'한빛테크': h_sales, '미래솔루션': m_sales, '새봄산업': s_sales})
pearson_corr = matrix_df.corr(method='pearson').round(3).to_dict()
spearman_corr = matrix_df.corr(method='spearman').round(3).to_dict()

heatmap_data = {}
for name, arr in [('한빛테크', h_sales), ('미래솔루션', m_sales), ('새봄산업', s_sales)]:
    mat = []
    for y_idx in range(5):
        yr_vals = [round(float(arr[y_idx*12 + m]), 2) for m in range(12)]
        mat.append(yr_vals)
    heatmap_data[name] = mat

master_data = {
    'dates': dates,
    'months_count': N,
    'years': [2021, 2022, 2023, 2024, 2025],
    'companies': companies_data,
    'market': {
        'total_monthly': total_market_monthly,
        'share_hanbit': share_hanbit,
        'share_mirae': share_mirae,
        'share_saebom': share_saebom,
        'hhi_monthly': hhi_monthly,
        'hhi_mean': round(float(np.mean(hhi_monthly)), 1),
        'hhi_2021': round(float(np.mean(hhi_monthly[:12])), 1),
        'hhi_2025': round(float(np.mean(hhi_monthly[-12:])), 1),
        'total_revenue_5y': round(float(np.sum(total_market_monthly)), 2),
        'pearson_corr': pearson_corr,
        'spearman_corr': spearman_corr,
        'heatmap': heatmap_data
    }
}

with open('data.js', 'w', encoding='utf-8') as f:
    f.write('const MASTER_DATA = ')
    json.dump(master_data, f, ensure_ascii=False, indent=2)
    f.write(';\n')

print('data.js generated successfully!')
