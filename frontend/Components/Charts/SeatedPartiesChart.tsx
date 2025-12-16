import React, { useState, useEffect } from 'react';
import { getSeatedPartiesPerHour } from '../../api/analytics.api';

// Dynamic import for Chart.js to handle potential loading issues
let Chart: any = null;
let Line: any = null;

const loadChartJS = async () => {
  try {
    const chartModule = await import('chart.js');
    const reactChartModule = await import('react-chartjs-2');
    
    chartModule.Chart.register(
      chartModule.CategoryScale,
      chartModule.LinearScale,
      chartModule.PointElement,
      chartModule.LineElement,
      chartModule.Title,
      chartModule.Tooltip,
      chartModule.Legend,
      chartModule.Filler
    );
    
    Chart = chartModule.Chart;
    Line = reactChartModule.Line;
    return true;
  } catch (error) {
    console.error('Failed to load Chart.js:', error);
    return false;
  }
};

interface HourlyData {
  hour: string;
  count: number;
}

// Fallback SVG Chart Component
const SVGChart: React.FC<{ data: HourlyData[] }> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  const generateAreaPath = () => {
    if (data.length === 0) return { linePath: '', areaPath: '', points: [] };
    
    const padding = 5;
    const width = 100 - padding * 2;
    const height = 75;
    
    const points = data.map((item, index) => {
      const x = padding + (index / Math.max(data.length - 1, 1)) * width;
      const y = 15 + height - (item.count / maxCount) * height;
      return { x, y, count: item.count };
    });
    
    let linePath = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const midX = (current.x + next.x) / 2;
      linePath += ` Q ${midX} ${current.y}, ${midX} ${(current.y + next.y) / 2}`;
      linePath += ` Q ${midX} ${next.y}, ${next.x} ${next.y}`;
    }
    
    const lastPoint = points[points.length - 1];
    const areaPath = `${linePath} L ${lastPoint.x} 90 L ${points[0].x} 90 Z`;
    
    return { linePath, areaPath, points };
  };

  const { linePath, areaPath, points } = generateAreaPath();

  return (
    <div className="h-48 sm:h-64 w-full flex flex-col">
      <div className="flex-1 w-full">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5D3FD3" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#5D3FD3" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          <line x1="5" y1="15" x2="5" y2="90" stroke="#e5e7eb" strokeWidth="0.3" />
          <line x1="5" y1="90" x2="95" y2="90" stroke="#e5e7eb" strokeWidth="0.3" />
          
          <path d={areaPath} fill="url(#areaGradient)" />
          <path d={linePath} fill="none" stroke="#5D3FD3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          
          {points.map((point, index) => (
            <g key={index}>
              <circle cx={point.x} cy={point.y} r="1.5" fill="#5D3FD3" stroke="white" strokeWidth="0.5" />
              {point.count > 0 && (
                <text x={point.x} y={point.y - 3} textAnchor="middle" fontSize="3" fill="#374151" fontWeight="600">
                  {point.count}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      
      <div className="flex justify-between px-1 sm:px-2 mt-2">
        {data.map((item, index) => (
          <span key={index} className="text-[8px] sm:text-[10px] text-gray-500">{item.hour}</span>
        ))}
      </div>
    </div>
  );
};

const SeatedPartiesChart: React.FC = () => {
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartJSLoaded, setChartJSLoaded] = useState(false);

  const fetchHourlyData = async () => {
    try {
      const data = await getSeatedPartiesPerHour();
      setHourlyData(data || []);
    } catch (error) {
      console.error('Error fetching hourly data:', error);
      setHourlyData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load Chart.js and fetch data
    const initChart = async () => {
      const loaded = await loadChartJS();
      setChartJSLoaded(loaded);
      await fetchHourlyData();
    };
    
    initChart();
    
    // Reduce polling frequency for chart data (every 5 minutes)
    const interval = setInterval(fetchHourlyData, 300000);
    return () => clearInterval(interval);
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#5D3FD3',
        borderWidth: 1,
        callbacks: {
          title: (context: any) => `${context[0].label}`,
          label: (context: any) => `Parties seated: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 10,
          },
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 10,
          },
          stepSize: 1,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const chartData = {
    labels: hourlyData.map(item => item.hour),
    datasets: [
      {
        label: 'Seated Parties',
        data: hourlyData.map(item => item.count),
        borderColor: '#5D3FD3',
        backgroundColor: 'rgba(93, 63, 211, 0.1)',
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: '#5D3FD3',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#5D3FD3',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100 min-h-[320px]">
      <h3 className="text-[#5D3FD3] font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
        Seated Parties Per Hour
      </h3>
      
      {loading ? (
        <div className="h-48 sm:h-64 w-full">
          <div className="w-full h-full bg-gray-100 rounded animate-pulse flex items-end justify-between p-4 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div 
                key={i} 
                className="bg-gray-200 rounded-sm animate-pulse" 
                style={{ 
                  height: `${Math.random() * 60 + 20}%`, 
                  width: '10%' 
                }}
              />
            ))}
          </div>
        </div>
      ) : hourlyData.length === 0 ? (
        <div className="h-48 sm:h-64 flex items-center justify-center text-gray-500 text-xs sm:text-sm">
          No data available for today
        </div>
      ) : (
        <div className="h-48 sm:h-64 w-full">
          {chartJSLoaded && Line ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <SVGChart data={hourlyData} />
          )}
        </div>
      )}
    </div>
  );
};

export default SeatedPartiesChart;