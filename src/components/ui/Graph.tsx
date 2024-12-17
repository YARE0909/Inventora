import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Pie,
  Cell,
  PieChart,
} from "recharts";

interface DataPoint {
  label: string;
  [key: string]: number | string; // Allows multiple data series
}

interface GraphProps {
  data: DataPoint[];
  graphType: "bar" | "line" | "pie" | "ring";
  dataKeys?: string[]; // Array of keys for multiple data series
  fillColors?: string[]; // Custom colors for data series
}

const patternFlyColors = [
  "#3b82f6", // Blue
  "#06b6d4", // Cyan
  "#10b981", // Green
  "#6366f1", // Purple
  "#ef4444", // Red
  "#8b5cf6", // Violet
];

const getVibrantColors = (count: number): string[] => {
  const colors = [];
  const availableColors = [...patternFlyColors];
  for (let i = 0; i < count; i++) {
    if (availableColors.length === 0) {
      availableColors.push(...patternFlyColors); // Refill when exhausted
    }
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    colors.push(availableColors.splice(randomIndex, 1)[0]);
  }
  return colors;
};

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}> = ({ active, payload, label }) => {
  if (active && payload) {
    return (
      <div className="bg-foreground p-2 rounded-md">
        <p className="text-text text-sm font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={`tooltip-${index}`} className="text-text text-sm">
            {`${entry.name} : ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Graph: React.FC<GraphProps> = ({
  data,
  graphType,
  dataKeys = ["value"],
  fillColors,
}) => {
  const vibrantColors = fillColors || getVibrantColors(dataKeys.length);

  return (
    <div className="bg-background p-4 rounded-lg shadow-md">
      <ResponsiveContainer width="100%" height={300}>
        {graphType === "bar" ? (
          <BarChart data={data}>
            <XAxis dataKey="label" className="text-textAlt" />
            <YAxis className="text-textAlt" />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "transparent" }}
            />
            <Legend />
            {dataKeys.map((key, index) => (
              <Bar key={key} dataKey={key} fill={vibrantColors[index]} />
            ))}
          </BarChart>
        ) : graphType === "line" ? (
          <LineChart data={data}>
            <XAxis dataKey="label" className="text-textAlt" />
            <YAxis className="text-textAlt" />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "transparent" }}
            />
            <Legend />
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={vibrantColors[index]}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        ) : graphType === "pie" ? (
          <PieChart>
            <Legend />
            <Pie
              data={data}
              dataKey={dataKeys[0]}
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.map((_, index) => (
                <Cell key={`pie-cell-${index}`} fill={vibrantColors[index]} />
              ))}
            </Pie>
          </PieChart>
        ) : graphType === "ring" ? (
          <PieChart>
            <Legend />
            <Pie
              data={data}
              dataKey={dataKeys[0]}
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={100}
              label
            >
              {data.map((_, index) => (
                <Cell key={`ring-cell-${index}`} fill={vibrantColors[index]} />
              ))}
            </Pie>
          </PieChart>
        ) : (
          <div>
            <p className="text-text text-center">Invalid graph type</p>
          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default Graph;
