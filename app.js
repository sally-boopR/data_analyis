/**
 * Sales Analytics Pro Dashboard - Main Engine
 * 100% Client-Side Pure JavaScript
 * No Build Step, Zero External Requests, Completely Offline
 */

// Global Chart Store
const charts = {};

// Current State
let currentCompany = 'all'; // 'all', '한빛테크', '미래솔루션', '새봄산업'
let currentTheme = 'dark';

// Color Palette
const COLORS = {
  hanbit: '#3B82F6',
  hanbitAlpha: 'rgba(59, 130, 246, 0.25)',
  mirae: '#10B981',
  miraeAlpha: 'rgba(16, 185, 129, 0.25)',
  saebom: '#F59E0B',
  saebomAlpha: 'rgba(245, 158, 11, 0.25)',
  purple: '#8B5CF6',
  purpleAlpha: 'rgba(139, 92, 246, 0.25)',
  cyan: '#06B6D4',
  danger: '#EF4444',
  dangerAlpha: 'rgba(239, 68, 68, 0.25)',
  gridDark: '#334155',
  gridLight: '#E2E8F0',
  textDark: '#94A3B8',
  textLight: '#475569'
};

// Check if Chart.js is loaded
if (typeof Chart === 'undefined') {
  console.error('Chart.js library is not loaded!');
}

// Chart.js Global Config
Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Pretendard", sans-serif';
Chart.defaults.font.size = 12;
Chart.defaults.color = COLORS.textDark;
Chart.defaults.borderColor = COLORS.gridDark;
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 6;
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTabs();
  initCompanySelector();
  initHeatmap();
  initCorrelationMatrix();
  initAllCharts();
});

// Theme Management
function initTheme() {
  const themeBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  
  themeBtn.addEventListener('click', () => {
    if (document.body.classList.contains('light-theme')) {
      document.body.classList.remove('light-theme');
      currentTheme = 'dark';
      themeIcon.textContent = '☀️';
      Chart.defaults.color = COLORS.textDark;
      Chart.defaults.borderColor = COLORS.gridDark;
    } else {
      document.body.classList.add('light-theme');
      currentTheme = 'light';
      themeIcon.textContent = '🌙';
      Chart.defaults.color = COLORS.textLight;
      Chart.defaults.borderColor = COLORS.gridLight;
    }
    updateAllChartsTheme();
  });
}

function updateAllChartsTheme() {
  const gridColor = currentTheme === 'dark' ? COLORS.gridDark : COLORS.gridLight;
  const textColor = currentTheme === 'dark' ? COLORS.textDark : COLORS.textLight;

  Object.values(charts).forEach(chart => {
    if (chart && chart.options) {
      if (chart.options.scales) {
        Object.values(chart.options.scales).forEach(scale => {
          if (scale.grid) scale.grid.color = gridColor;
          if (scale.ticks) scale.ticks.color = textColor;
        });
      }
      chart.update();
    }
  });
}

// Tab Switching
function initTabs() {
  const tabButtons = document.querySelectorAll('.nav-tab-btn');
  const tabSections = document.querySelectorAll('.tab-content-section');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabSections.forEach(s => s.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetSec = document.getElementById(targetId);
      if (targetSec) {
        targetSec.classList.add('active');
        // Trigger resize for charts in newly visible tab
        setTimeout(() => {
          Object.values(charts).forEach(c => {
            if (c) c.resize();
          });
        }, 50);
      }
    });
  });
}

// Company Focus Filter
function initCompanySelector() {
  const pills = document.querySelectorAll('.company-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCompany = pill.getAttribute('data-company');
      onCompanyChange();
    });
  });
}

function onCompanyChange() {
  // Re-render single-company dependent charts
  renderTech01();
  renderTech05();
  renderTech06();
  renderTech07();
  renderTech08();
  renderTech17();
  renderTech18();
  renderTech19();
  renderTech20();
  renderHeatmapTable();
}

// =========================================================================
// Chart Renderers (20 Techniques)
// =========================================================================

function initAllCharts() {
  renderMasterTrend();
  renderTech01();
  renderTech02();
  renderTech03();
  renderTech04();
  renderTech05();
  renderTech06();
  renderTech07();
  renderTech08();
  renderTech09();
  renderTech11();
  renderTech12();
  renderTech14();
  renderTech15();
  renderTech16();
  renderTech17();
  renderTech18();
  renderTech19();
  renderTech20();
}

// Master Overview Chart
function renderMasterTrend() {
  const ctx = document.getElementById('chartMasterTrend').getContext('2d');
  const d = MASTER_DATA;
  charts.masterTrend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: d.dates,
      datasets: [
        {
          label: '한빛테크 매출(억)',
          data: d.companies['한빛테크'].raw_sales,
          borderColor: COLORS.hanbit,
          backgroundColor: COLORS.hanbitAlpha,
          borderWidth: 2.5,
          tension: 0.25,
          pointRadius: 2,
          pointHoverRadius: 6
        },
        {
          label: '미래솔루션 매출(억)',
          data: d.companies['미래솔루션'].raw_sales,
          borderColor: COLORS.mirae,
          backgroundColor: COLORS.miraeAlpha,
          borderWidth: 2.5,
          tension: 0.25,
          pointRadius: 2,
          pointHoverRadius: 6
        },
        {
          label: '새봄산업 매출(억)',
          data: d.companies['새봄산업'].raw_sales,
          borderColor: COLORS.saebom,
          backgroundColor: COLORS.saebomAlpha,
          borderWidth: 2.5,
          tension: 0.25,
          pointRadius: 2,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', labels: { usePointStyle: true, padding: 16 } },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} 억원`
          }
        }
      },
      scales: {
        x: { ticks: { maxTicksLimit: 12 } },
        y: { title: { display: true, text: '매출액 (억원)' }, min: 5, max: 20 }
      }
    }
  });
}

// Tech 01: Descriptive Statistics & Distribution
function renderTech01() {
  const ctx = document.getElementById('chartTech01').getContext('2d');
  if (charts.tech01) charts.tech01.destroy();

  const cNames = ['한빛테크', '미래솔루션', '새봄산업'];
  const means = cNames.map(c => MASTER_DATA.companies[c].stats.mean);
  const medians = cNames.map(c => MASTER_DATA.companies[c].stats.median);
  const mins = cNames.map(c => MASTER_DATA.companies[c].stats.min);
  const maxs = cNames.map(c => MASTER_DATA.companies[c].stats.max);

  charts.tech01 = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: cNames,
      datasets: [
        { label: '최저 매출', data: mins, backgroundColor: '#64748B' },
        { label: '중앙값 (Median)', data: medians, backgroundColor: '#38BDF8' },
        { label: '평균 매출 (Mean)', data: means, backgroundColor: '#818CF8' },
        { label: '최고 매출', data: maxs, backgroundColor: '#34D399' }
      ]
    },
    options: {
      plugins: {
        legend: { position: 'top' },
        tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.y} 억원` } }
      },
      scales: {
        y: { title: { display: true, text: '매출액 (억원)' }, beginAtZero: false, min: 5 }
      }
    }
  });

  // Render Metric Chips
  const container = document.getElementById('metricsTech01');
  const targetC = currentCompany === 'all' ? '한빛테크' : currentCompany;
  const st = MASTER_DATA.companies[targetC].stats;
  container.innerHTML = `
    <div class="tech-metric-chip">
      <span class="chip-label">${targetC} 평균</span>
      <span class="chip-val">${st.mean} 억</span>
    </div>
    <div class="tech-metric-chip">
      <span class="chip-label">중앙값</span>
      <span class="chip-val">${st.median} 억</span>
    </div>
    <div class="tech-metric-chip">
      <span class="chip-label">표준편차 (Std)</span>
      <span class="chip-val">±${st.std}</span>
    </div>
    <div class="tech-metric-chip">
      <span class="chip-label">사분위수범위(IQR)</span>
      <span class="chip-val">${st.iqr}</span>
    </div>
    <div class="tech-metric-chip">
      <span class="chip-label">변동계수 (CV)</span>
      <span class="chip-val">${st.cv}%</span>
    </div>
    <div class="tech-metric-chip">
      <span class="chip-label">왜도 (Skewness)</span>
      <span class="chip-val">${st.skew}</span>
    </div>
  `;
}

// Tech 02: CAGR & YoY
function renderTech02() {
  const ctx = document.getElementById('chartTech02').getContext('2d');
  const years = ['2022', '2023', '2024', '2025'];
  const hanbitYoY = years.map(y => MASTER_DATA.companies['한빛테크'].yoy_rates[y]);
  const miraeYoY = years.map(y => MASTER_DATA.companies['미래솔루션'].yoy_rates[y]);
  const saebomYoY = years.map(y => MASTER_DATA.companies['새봄산업'].yoy_rates[y]);

  charts.tech02 = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: years.map(y => y + '년 (전년비 YoY)'),
      datasets: [
        { label: '한빛테크 YoY (%)', data: hanbitYoY, backgroundColor: COLORS.hanbit },
        { label: '미래솔루션 YoY (%)', data: miraeYoY, backgroundColor: COLORS.mirae },
        { label: '새봄산업 YoY (%)', data: saebomYoY, backgroundColor: COLORS.saebom }
      ]
    },
    options: {
      plugins: {
        legend: { position: 'top' },
        tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.y > 0 ? '+' : ''}${c.parsed.y}%` } }
      },
      scales: {
        y: {
          title: { display: true, text: '전년 대비 성장률 (%)' },
          ticks: { callback: v => v + '%' }
        }
      }
    }
  });
}

// Tech 03: Risk-Return Scatter
function renderTech03() {
  const ctx = document.getElementById('chartTech03').getContext('2d');
  const cList = ['한빛테크', '미래솔루션', '새봄산업'];
  const scatterData = cList.map(c => {
    const comp = MASTER_DATA.companies[c];
    return {
      x: comp.stats.cv,
      y: comp.cagr_5y,
      r: comp.total_5y / 35, // bubble size
      company: c
    };
  });

  charts.tech03 = new Chart(ctx, {
    type: 'bubble',
    data: {
      datasets: [
        {
          label: '한빛테크',
          data: [scatterData[0]],
          backgroundColor: COLORS.hanbitAlpha,
          borderColor: COLORS.hanbit,
          borderWidth: 2
        },
        {
          label: '미래솔루션',
          data: [scatterData[1]],
          backgroundColor: COLORS.miraeAlpha,
          borderColor: COLORS.mirae,
          borderWidth: 2
        },
        {
          label: '새봄산업',
          data: [scatterData[2]],
          backgroundColor: COLORS.saebomAlpha,
          borderColor: COLORS.saebom,
          borderWidth: 2
        }
      ]
    },
    options: {
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: c => ` ${c.raw.company}: 변동계수 ${c.raw.x}%, CAGR ${c.raw.y}%`
          }
        }
      },
      scales: {
        x: { title: { display: true, text: '변동계수 CV (리스크/변동성 %)' }, min: 5, max: 28 },
        y: { title: { display: true, text: '5개년 연평균 복합 성장률 CAGR (%)' }, min: -5, max: 20 }
      }
    }
  });
}

// Tech 04: Cumulative Revenue Trajectory
function renderTech04() {
  const ctx = document.getElementById('chartTech04').getContext('2d');
  const d = MASTER_DATA;
  charts.tech04 = new Chart(ctx, {
    type: 'line',
    data: {
      labels: d.dates,
      datasets: [
        {
          label: '한빛테크 누적매출',
          data: d.companies['한빛테크'].cum_sales,
          borderColor: COLORS.hanbit,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.1
        },
        {
          label: '새봄산업 누적매출',
          data: d.companies['새봄산업'].cum_sales,
          borderColor: COLORS.saebom,
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          fill: true,
          tension: 0.1
        },
        {
          label: '미래솔루션 누적매출',
          data: d.companies['미래솔루션'].cum_sales,
          borderColor: COLORS.mirae,
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          fill: true,
          tension: 0.1
        }
      ]
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top' },
        tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.y} 억원` } }
      },
      scales: {
        x: { ticks: { maxTicksLimit: 12 } },
        y: { title: { display: true, text: '누적 매출액 (억원)' } }
      }
    }
  });
}

// Tech 05: Moving Averages (SMA 3, 6, 12)
function renderTech05() {
  const ctx = document.getElementById('chartTech05').getContext('2d');
  if (charts.tech05) charts.tech05.destroy();

  const targetC = currentCompany === 'all' ? '한빛테크' : currentCompany;
  const comp = MASTER_DATA.companies[targetC];

  charts.tech05 = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MASTER_DATA.dates,
      datasets: [
        {
          label: `${targetC} 실제 매출`,
          data: comp.raw_sales,
          borderColor: '#94A3B8',
          borderWidth: 1.5,
          borderDash: [3, 3],
          pointRadius: 1
        },
        {
          label: 'SMA 3개월 (단기추세)',
          data: comp.sma3,
          borderColor: '#38BDF8',
          borderWidth: 2,
          pointRadius: 0
        },
        {
          label: 'SMA 6개월 (중기추세)',
          data: comp.sma6,
          borderColor: '#F59E0B',
          borderWidth: 2,
          pointRadius: 0
        },
        {
          label: 'SMA 12개월 (기저 기조 추세)',
          data: comp.sma12,
          borderColor: '#EF4444',
          borderWidth: 3,
          pointRadius: 0
        }
      ]
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top' },
        tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.y} 억` } }
      },
      scales: {
        x: { ticks: { maxTicksLimit: 12 } },
        y: { title: { display: true, text: '매출액 (억원)' } }
      }
    }
  });
}

// Tech 06: Time-Series Additive Decomposition
function renderTech06() {
  const ctx = document.getElementById('chartTech06').getContext('2d');
  if (charts.tech06) charts.tech06.destroy();

  const targetC = currentCompany === 'all' ? '한빛테크' : currentCompany;
  const comp = MASTER_DATA.companies[targetC];
  const decomp = comp.decomposition;

  charts.tech06 = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MASTER_DATA.dates,
      datasets: [
        {
          label: `${targetC} 관측치 (Observed)`,
          data: comp.raw_sales,
          borderColor: comp.color,
          borderWidth: 1.5,
          pointRadius: 0
        },
        {
          label: '장기 추세 (Trend $T_t$)',
          data: decomp.trend,
          borderColor: '#8B5CF6',
          borderWidth: 2.5,
          pointRadius: 0
        },
        {
          label: '계절 성분 (Seasonal $S_t$)',
          data: decomp.seasonal,
          borderColor: '#06B6D4',
          borderWidth: 1.8,
          pointRadius: 0
        },
        {
          label: '잔차/노이즈 (Residual $R_t$)',
          data: decomp.residual,
          borderColor: '#64748B',
          borderWidth: 1,
          borderDash: [2, 2],
          pointRadius: 0
        }
      ]
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { ticks: { maxTicksLimit: 12 } },
        y: { title: { display: true, text: '성분 분해 값 (억원)' } }
      }
    }
  });
}

// Tech 07: EMA & Spread
function renderTech07() {
  const ctx = document.getElementById('chartTech07').getContext('2d');
  if (charts.tech07) charts.tech07.destroy();

  const targetC = currentCompany === 'all' ? '한빛테크' : currentCompany;
  const comp = MASTER_DATA.companies[targetC];

  charts.tech07 = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: MASTER_DATA.dates,
      datasets: [
        {
          type: 'line',
          label: `${targetC} EMA 6M (단기)`,
          data: comp.ema6,
          borderColor: '#38BDF8',
          borderWidth: 2,
          pointRadius: 0,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: `${targetC} EMA 12M (중기)`,
          data: comp.ema12,
          borderColor: '#EF4444',
          borderWidth: 2,
          pointRadius: 0,
          yAxisID: 'y'
        },
        {
          type: 'bar',
          label: 'EMA Spread (단기-중기 오실레이터)',
          data: comp.ema_spread,
          backgroundColor: comp.ema_spread.map(v => v >= 0 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(239, 68, 68, 0.4)'),
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { ticks: { maxTicksLimit: 12 } },
        y: { position: 'left', title: { display: true, text: '매출 지수 (억)' } },
        y1: { position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: '스프레드 오실레이터' } }
      }
    }
  });
}

// Tech 08: HP Filter Cyclical Gap
function renderTech08() {
  const ctx = document.getElementById('chartTech08').getContext('2d');
  if (charts.tech08) charts.tech08.destroy();

  const targetC = currentCompany === 'all' ? '한빛테크' : currentCompany;
  const comp = MASTER_DATA.companies[targetC];
  const hp = comp.hp_filter;

  charts.tech08 = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: MASTER_DATA.dates,
      datasets: [
        {
          type: 'line',
          label: 'HP 잠재 추세 (Potential Trend)',
          data: hp.trend,
          borderColor: '#8B5CF6',
          borderWidth: 2.5,
          pointRadius: 0,
          yAxisID: 'y'
        },
        {
          type: 'bar',
          label: '경기 순환 갭 (Cyclical Gap)',
          data: hp.cycle,
          backgroundColor: hp.cycle.map(v => v >= 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'),
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { ticks: { maxTicksLimit: 12 } },
        y: { position: 'left', title: { display: true, text: '잠재 매출 추세 (억)' } },
        y1: { position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: '순환 변동 갭 (억)' } }
      }
    }
  });
}

// Tech 09: Monthly Seasonal Index (Base 100)
function renderTech09() {
  const ctx = document.getElementById('chartTech09').getContext('2d');
  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const hIdx = MASTER_DATA.companies['한빛테크'].seasonal_index;
  const mIdx = MASTER_DATA.companies['미래솔루션'].seasonal_index;
  const sIdx = MASTER_DATA.companies['새봄산업'].seasonal_index;

  charts.tech09 = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: months,
      datasets: [
        {
          label: '한빛테크 계절지수',
          data: hIdx,
          borderColor: COLORS.hanbit,
          backgroundColor: COLORS.hanbitAlpha,
          borderWidth: 2
        },
        {
          label: '미래솔루션 계절지수',
          data: mIdx,
          borderColor: COLORS.mirae,
          backgroundColor: COLORS.miraeAlpha,
          borderWidth: 2
        },
        {
          label: '새봄산업 계절지수',
          data: sIdx,
          borderColor: COLORS.saebom,
          backgroundColor: COLORS.saebomAlpha,
          borderWidth: 2
        }
      ]
    },
    options: {
      plugins: {
        legend: { position: 'top' },
        tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.raw}% (평균=100%)` } }
      },
      scales: {
        r: {
          min: 80,
          max: 125,
          ticks: { stepSize: 10, backdropColor: 'transparent' }
        }
      }
    }
  });
}

// Tech 10: Seasonality Heatmap
function initHeatmap() {
  renderHeatmapTable();
}

function renderHeatmapTable() {
  const container = document.getElementById('heatmapContainer');
  const targetC = currentCompany === 'all' ? '한빛테크' : currentCompany;
  const mat = MASTER_DATA.market.heatmap[targetC];
  const years = MASTER_DATA.years;
  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  // Find min and max for color scaling
  let flat = [];
  mat.forEach(r => flat.push(...r));
  const minV = Math.min(...flat);
  const maxV = Math.max(...flat);

  let html = `<table class="heatmap-table">
    <thead>
      <tr>
        <th>연도</th>
        ${months.map(m => `<th>${m}</th>`).join('')}
      </tr>
    </thead>
    <tbody>`;

  years.forEach((yr, yIdx) => {
    html += `<tr><td style="font-weight:700; color:var(--text-primary);">${yr}년</td>`;
    mat[yIdx].forEach(val => {
      // ratio 0 to 1
      const ratio = (val - minV) / (maxV - minV);
      // Generate blue-cyan gradient
      const bg = `rgba(59, 130, 246, ${0.15 + ratio * 0.8})`;
      html += `<td style="background:${bg};" title="${yr}년: ${val}억원">${val}</td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

// Tech 11: Quarterly Waterfall & Stack
function renderTech11() {
  const ctx = document.getElementById('chartTech11').getContext('2d');
  const quarters = ['Q1 (1~3월)', 'Q2 (4~6월)', 'Q3 (7~9월)', 'Q4 (10~12월)'];
  
  // Aggregate 5 years by quarter
  const getQSum = (comp) => {
    const qData = [0, 0, 0, 0];
    Object.entries(comp.quarterly_sums).forEach(([k, v]) => {
      const qNum = parseInt(k.split('-Q')[1]) - 1;
      qData[qNum] += v;
    });
    return qData.map(v => Math.round(v * 10) / 10);
  };

  charts.tech11 = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: quarters,
      datasets: [
        { label: '한빛테크 5개년 누적 (억)', data: getQSum(MASTER_DATA.companies['한빛테크']), backgroundColor: COLORS.hanbit },
        { label: '미래솔루션 5개년 누적 (억)', data: getQSum(MASTER_DATA.companies['미래솔루션']), backgroundColor: COLORS.mirae },
        { label: '새봄산업 5개년 누적 (억)', data: getQSum(MASTER_DATA.companies['새봄산업']), backgroundColor: COLORS.saebom }
      ]
    },
    options: {
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { stacked: true },
        y: { stacked: true, title: { display: true, text: '분기 누적 총매출 (억원)' } }
      }
    }
  });
}

// Tech 12: Autocorrelation Function (ACF)
function renderTech12() {
  const ctx = document.getElementById('chartTech12').getContext('2d');
  const lags = Array.from({ length: 12 }, (_, i) => `Lag ${i + 1}`);
  const hAcf = MASTER_DATA.companies['한빛테크'].acf.values;
  const mAcf = MASTER_DATA.companies['미래솔루션'].acf.values;
  const sAcf = MASTER_DATA.companies['새봄산업'].acf.values;
  const ci = MASTER_DATA.companies['한빛테크'].acf.ci; // 0.253

  charts.tech12 = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: lags,
      datasets: [
        { label: '한빛테크 ACF', data: hAcf, backgroundColor: COLORS.hanbit },
        { label: '미래솔루션 ACF', data: mAcf, backgroundColor: COLORS.mirae },
        { label: '새봄산업 ACF', data: sAcf, backgroundColor: COLORS.saebom },
        {
          type: 'line',
          label: '95% 유의성 임계선 (+0.253)',
          data: Array(12).fill(ci),
          borderColor: '#EF4444',
          borderDash: [4, 4],
          pointRadius: 0
        }
      ]
    },
    options: {
      plugins: { legend: { position: 'top' } },
      scales: {
        y: { min: -0.4, max: 1.0, title: { display: true, text: '자기상관계수 (ACF)' } }
      }
    }
  });
}

// Tech 13: Correlation Matrix
function initCorrelationMatrix() {
  const container = document.getElementById('corrTableContainer');
  const p = MASTER_DATA.market.pearson_corr;
  const companies = ['한빛테크', '미래솔루션', '새봄산업'];

  let html = `<table class="matrix-table">
    <thead>
      <tr>
        <th>기업명</th>
        ${companies.map(c => `<th>${c}</th>`).join('')}
      </tr>
    </thead>
    <tbody>`;

  companies.forEach(r => {
    html += `<tr><td style="font-weight:700;">${r}</td>`;
    companies.forEach(c => {
      const val = p[r][c];
      let colorStyle = '';
      if (val === 1) colorStyle = 'background:rgba(59, 130, 246, 0.3); font-weight:700;';
      else if (val > 0.5) colorStyle = 'background:rgba(16, 185, 129, 0.25); color:#34D399; font-weight:700;';
      else if (val < 0) colorStyle = 'background:rgba(239, 68, 68, 0.25); color:#F87171; font-weight:700;';
      html += `<td style="${colorStyle}">${val}</td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

// Tech 14: Dynamic Market Share
function renderTech14() {
  const ctx = document.getElementById('chartTech14').getContext('2d');
  const d = MASTER_DATA;

  charts.tech14 = new Chart(ctx, {
    type: 'line',
    data: {
      labels: d.dates,
      datasets: [
        {
          label: '한빛테크 점유율 (%)',
          data: d.market.share_hanbit,
          borderColor: COLORS.hanbit,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          fill: true,
          pointRadius: 0
        },
        {
          label: '미래솔루션 점유율 (%)',
          data: d.market.share_mirae,
          borderColor: COLORS.mirae,
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          fill: true,
          pointRadius: 0
        },
        {
          label: '새봄산업 점유율 (%)',
          data: d.market.share_saebom,
          borderColor: COLORS.saebom,
          backgroundColor: 'rgba(245, 158, 11, 0.5)',
          fill: true,
          pointRadius: 0
        }
      ]
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { ticks: { maxTicksLimit: 12 } },
        y: { stacked: true, min: 0, max: 100, title: { display: true, text: '점유율 비중 (%)' } }
      }
    }
  });
}

// Tech 15: HHI Index
function renderTech15() {
  const ctx = document.getElementById('chartTech15').getContext('2d');
  const d = MASTER_DATA;

  charts.tech15 = new Chart(ctx, {
    type: 'line',
    data: {
      labels: d.dates,
      datasets: [
        {
          label: '월간 HHI 집중도 지수',
          data: d.market.hhi_monthly,
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          fill: true,
          borderWidth: 2.5,
          tension: 0.2,
          pointRadius: 1
        },
        {
          label: '고과점 시장 기준선 (2,500 pt)',
          data: Array(d.dates.length).fill(2500),
          borderColor: '#EF4444',
          borderDash: [5, 5],
          pointRadius: 0
        }
      ]
    },
    options: {
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { ticks: { maxTicksLimit: 12 } },
        y: { min: 2400, max: 4000, title: { display: true, text: 'HHI 지수 (Point)' } }
      }
    }
  });
}

// Tech 16: Indexed Growth (Base 100)
function renderTech16() {
  const ctx = document.getElementById('chartTech16').getContext('2d');
  const d = MASTER_DATA;

  charts.tech16 = new Chart(ctx, {
    type: 'line',
    data: {
      labels: d.dates,
      datasets: [
        {
          label: '한빛테크 (기준 100)',
          data: d.companies['한빛테크'].indexed,
          borderColor: COLORS.hanbit,
          borderWidth: 2.5,
          pointRadius: 0
        },
        {
          label: '미래솔루션 (기준 100)',
          data: d.companies['미래솔루션'].indexed,
          borderColor: COLORS.mirae,
          borderWidth: 2.5,
          pointRadius: 0
        },
        {
          label: '새봄산업 (기준 100)',
          data: d.companies['새봄산업'].indexed,
          borderColor: COLORS.saebom,
          borderWidth: 2.5,
          pointRadius: 0
        },
        {
          label: '원점 기준선 (100.0)',
          data: Array(d.dates.length).fill(100),
          borderColor: '#64748B',
          borderDash: [4, 4],
          pointRadius: 0
        }
      ]
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { ticks: { maxTicksLimit: 12 } },
        y: { min: 60, max: 240, title: { display: true, text: '상대 성장 지수 (2021.01 = 100)' } }
      }
    }
  });
}

// Tech 17: Z-score Anomaly Detection
function renderTech17() {
  const ctx = document.getElementById('chartTech17').getContext('2d');
  if (charts.tech17) charts.tech17.destroy();

  const targetC = currentCompany === 'all' ? '한빛테크' : currentCompany;
  const comp = MASTER_DATA.companies[targetC];
  const zScores = comp.z_scores;

  charts.tech17 = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: MASTER_DATA.dates,
      datasets: [
        {
          label: `${targetC} Z-Score`,
          data: zScores,
          backgroundColor: zScores.map(z => Math.abs(z) >= 1.96 ? '#EF4444' : 'rgba(56, 189, 248, 0.4)')
        },
        {
          type: 'line',
          label: '상방 이상치 임계선 (+1.96σ)',
          data: Array(zScores.length).fill(1.96),
          borderColor: '#EF4444',
          borderDash: [4, 4],
          pointRadius: 0
        },
        {
          type: 'line',
          label: '하방 이상치 임계선 (-1.96σ)',
          data: Array(zScores.length).fill(-1.96),
          borderColor: '#EF4444',
          borderDash: [4, 4],
          pointRadius: 0
        }
      ]
    },
    options: {
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { ticks: { maxTicksLimit: 12 } },
        y: { min: -2.5, max: 3.0, title: { display: true, text: 'Z-Score (표준화 척도)' } }
      }
    }
  });
}

// Tech 18: Maximum Drawdown (MDD)
function renderTech18() {
  const ctx = document.getElementById('chartTech18').getContext('2d');
  if (charts.tech18) charts.tech18.destroy();

  const targetC = currentCompany === 'all' ? '한빛테크' : currentCompany;
  const comp = MASTER_DATA.companies[targetC];
  const dds = comp.mdd.drawdowns;

  charts.tech18 = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MASTER_DATA.dates,
      datasets: [
        {
          label: `${targetC} 고점 대비 낙폭 (Drawdown %)`,
          data: dds,
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          fill: true,
          tension: 0.15,
          pointRadius: 1
        }
      ]
    },
    options: {
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { ticks: { maxTicksLimit: 12 } },
        y: { min: -40, max: 5, title: { display: true, text: 'Drawdown (%)' } }
      }
    }
  });
}

// Tech 19: Linear Regression
function renderTech19() {
  const ctx = document.getElementById('chartTech19').getContext('2d');
  if (charts.tech19) charts.tech19.destroy();

  const targetC = currentCompany === 'all' ? '한빛테크' : currentCompany;
  const comp = MASTER_DATA.companies[targetC];
  const reg = comp.regression;

  charts.tech19 = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MASTER_DATA.dates,
      datasets: [
        {
          label: `${targetC} 실제 매출`,
          data: comp.raw_sales,
          borderColor: comp.color,
          backgroundColor: 'transparent',
          pointRadius: 2,
          pointHoverRadius: 5
        },
        {
          label: `선형 회귀 추세선 (기울기: ${reg.slope}억/월, R²: ${reg.r2})`,
          data: reg.line,
          borderColor: '#F59E0B',
          borderWidth: 2.5,
          pointRadius: 0
        }
      ]
    },
    options: {
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { ticks: { maxTicksLimit: 12 } },
        y: { title: { display: true, text: '매출액 (억원)' } }
      }
    }
  });
}

// Tech 20: Holt-Winters Forecast & Monte Carlo CI
function renderTech20() {
  const ctx = document.getElementById('chartTech20').getContext('2d');
  if (charts.tech20) charts.tech20.destroy();

  const targetC = currentCompany === 'all' ? '한빛테크' : currentCompany;
  const comp = MASTER_DATA.companies[targetC];
  const hw = comp.forecast;

  // Combine dates
  const fullDates = [...MASTER_DATA.dates, ...hw.forecast_dates];
  const historySeries = [...comp.raw_sales, ...Array(12).fill(null)];
  
  // Forecast Series connected to last actual point
  const lastActual = comp.raw_sales[comp.raw_sales.length - 1];
  const forecastSeries = [...Array(59).fill(null), lastActual, ...hw.forecast];
  const p10Series = [...Array(59).fill(null), lastActual, ...hw.p10];
  const p90Series = [...Array(59).fill(null), lastActual, ...hw.p90];

  charts.tech20 = new Chart(ctx, {
    type: 'line',
    data: {
      labels: fullDates,
      datasets: [
        {
          label: `${targetC} 실적 (2021~2025)`,
          data: historySeries,
          borderColor: comp.color,
          borderWidth: 2,
          pointRadius: 1
        },
        {
          label: '2026년 예측 중앙값 (P50)',
          data: forecastSeries,
          borderColor: '#8B5CF6',
          borderDash: [5, 5],
          borderWidth: 2.5,
          pointRadius: 2
        },
        {
          label: '90% 신뢰 상한 (P90 낙관)',
          data: p90Series,
          borderColor: 'rgba(139, 92, 246, 0.4)',
          borderWidth: 1,
          pointRadius: 0
        },
        {
          label: '10% 신뢰 하한 (P10 보수)',
          data: p10Series,
          borderColor: 'rgba(139, 92, 246, 0.4)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: '-1',
          borderWidth: 1,
          pointRadius: 0
        }
      ]
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top' },
        tooltip: { callbacks: { label: c => c.parsed.y ? ` ${c.dataset.label}: ${c.parsed.y} 억원` : '' } }
      },
      scales: {
        x: { ticks: { maxTicksLimit: 14 } },
        y: { title: { display: true, text: '매출액 (억원)' } }
      }
    }
  });
}
