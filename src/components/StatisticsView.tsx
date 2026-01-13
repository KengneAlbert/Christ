import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";
import {
  Eye,
  Download,
  FileText,
  Video,
  Music,
  Image,
  CheckCircle,
  AlertCircle,
  BarChart3,
} from "lucide-react";

interface MediaStats {
  total_media: number;
  total_views: number;
  total_downloads: number;
  total_published: number;
  total_videos: number;
  total_audios: number;
  total_documents: number;
  total_images: number;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-emerald-600" />
      </div>
      <div>
        <p className="text-sm text-slate-600">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  </div>
);

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

type ActiveShapeProps = {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: { name: string };
  percent: number;
  value: number;
};

const renderActiveShape = (props: ActiveShapeProps) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
      >{`${value} Média(s)`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {`(Taux: ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

export const StatisticsView: React.FC = () => {
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.rpc("get_media_statistics");

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setStats(data[0]);
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors du chargement des statistiques."
        );
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-6 h-6" />
          <h3 className="font-bold">Erreur de chargement</h3>
        </div>
        <p className="mt-2">
          {error || "Les données de statistiques n'ont pas pu être récupérées."}
        </p>
      </div>
    );
  }

  const pieData = [
    { name: "Vidéos", value: stats.total_videos },
    { name: "Documents", value: stats.total_documents },
    { name: "Audios", value: stats.total_audios },
    { name: "Images", value: stats.total_images },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Médias"
          value={stats.total_media}
          icon={FileText}
        />
        <StatCard title="Total Vues" value={stats.total_views} icon={Eye} />
        <StatCard
          title="Total Téléchargements"
          value={stats.total_downloads}
          icon={Download}
        />
        <StatCard
          title="Publiés"
          value={`${stats.total_published} / ${stats.total_media}`}
          icon={CheckCircle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-emerald-600" />
            Répartition par type
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                dataKey="value"
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={60}
                fill="#8884d8"
                paddingAngle={5}
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-emerald-600" />
            Statistiques détaillées
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-50">
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-blue-500" />
                <span>Vidéos</span>
              </div>
              <span className="font-bold text-slate-700">
                {stats.total_videos}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-50">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-500" />
                <span>Documents</span>
              </div>
              <span className="font-bold text-slate-700">
                {stats.total_documents}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-50">
              <div className="flex items-center space-x-2">
                <Music className="w-5 h-5 text-pink-500" />
                <span>Audios</span>
              </div>
              <span className="font-bold text-slate-700">
                {stats.total_audios}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-50">
              <div className="flex items-center space-x-2">
                <Image className="w-5 h-5 text-yellow-500" />
                <span>Images</span>
              </div>
              <span className="font-bold text-slate-700">
                {stats.total_images}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
