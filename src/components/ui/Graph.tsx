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
  LabelList,
} from "recharts";
import formatIndianCurrency from "@/utils/formatIndianCurrency";
import { numberFormatter, numberFormatterWithoutText } from "@/utils/numberFormatter";

interface DataPoint {
  label: string;
  [key: string]: number | string; // Allows multiple data series
}

interface GraphProps {
  data: DataPoint[];
  graphType: "bar" | "line" | "pie" | "ring";
  dataKeys?: {
    label: string;
    value: string;
  }[]; // Array of keys for multiple data series
  fillColors?: string[]; // Custom colors for data series
  height?: number;
}

const patternFlyColors = [
  "#3788D8", // Blue
  "#06b6d4", // Cyan
  "#10b981", // Green
  "#6366f1", // Purple
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#FFB74D", // Yellow
  "#FF4DE4", // Pink
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
        <p className="text-text text-sm font-bold">{label}</p>
        {payload.map((entry, index) => (
          <p key={`tooltip-${index}`} className="text-text text-sm font-bold">
            <span className="text-textAlt font-bold">
              {`${entry.name} : `}
            </span>
            {entry.name.includes("Value") ? formatIndianCurrency(entry.value) : entry.value}
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
  dataKeys = [],
  fillColors,
  height = 300,
}) => {
  const vibrantColors = fillColors || getVibrantColors(dataKeys.length);

  return (
    <div className="bg-background p-4 rounded-lg">
      <ResponsiveContainer width="100%" height={height}>
        {graphType === "bar" ? (
          <BarChart data={data}>
            <XAxis dataKey="label" className="text-textAlt font-bold" />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
            <Legend />
            {dataKeys.map((key, index) => (
              <Bar
                key={key.label}
                dataKey={key.value}
                fill={vibrantColors[index]}
                name={key.label}
                yAxisId={index === 0 ? "left" : "right"}
                style={{
                  borderRadius: "6px",
                }}
                radius={[4, 4, 0, 0]}
              >
                {/* Add LabelList to show values on top of bars */}
                <LabelList
                  dataKey={key.value}
                  position="insideTop"
                  className="text-white text-xs font-black"
                  style={{
                    fill: "#000",
                  }}
                  formatter={(value: number) => numberFormatterWithoutText(value)}
                />
              </Bar>
            ))}
          </BarChart>
        ) : graphType === "line" ? (
          <LineChart data={data}>
            <XAxis dataKey="label" className="text-textAlt" />
            <YAxis
              className="text-textAlt"
              allowDecimals={false}
              tickFormatter={numberFormatter} // Apply the formatter here
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
            <Legend />
            {dataKeys.map((key, index) => (
              <Line
                key={key.value}
                type="monotone"
                dataKey={key.label}
                stroke={vibrantColors[index]}
                strokeWidth={2}
                name={key.label} // This is where the `label` is used for display
              />
            ))}
          </LineChart>
        ) : graphType === "pie" ? (
          <PieChart>
            <Legend />
            <Pie
              data={data}
              dataKey={dataKeys[0].label}
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
              dataKey={dataKeys[0].label}
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
