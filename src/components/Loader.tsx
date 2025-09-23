import React from "react";
import { Loader2, Upload, Send, Save, Trash2, RefreshCw } from "lucide-react";

interface LoaderProps {
  type?: "default" | "upload" | "send" | "save" | "delete" | "refresh";
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({
  type = "default",
  size = "md",
  text,
  className = "",
}) => {
  const getIcon = () => {
    switch (type) {
      case "upload":
        return <Upload className={`animate-bounce ${getSizeClass()}`} />;
      case "send":
        return <Send className={`animate-pulse ${getSizeClass()}`} />;
      case "save":
        return <Save className={`animate-pulse ${getSizeClass()}`} />;
      case "delete":
        return <Trash2 className={`animate-pulse ${getSizeClass()}`} />;
      case "refresh":
        return <RefreshCw className={`animate-spin ${getSizeClass()}`} />;
      default:
        return <Loader2 className={`animate-spin ${getSizeClass()}`} />;
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "w-4 h-4";
      case "lg":
        return "w-8 h-8";
      default:
        return "w-6 h-6";
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "lg":
        return "text-lg";
      default:
        return "text-base";
    }
  };

  return (
    <div
      className={`flex items-center justify-center space-x-2 text-emerald-600 ${className}`}
    >
      {getIcon()}
      {text && (
        <span className={`${getTextSize()} font-medium animate-pulse`}>
          {text}
        </span>
      )}
    </div>
  );
};

// Composant de loader en overlay pour les modals
export const ModalLoader: React.FC<{
  text?: string;
  type?: LoaderProps["type"];
}> = ({ text = "Chargement...", type = "default" }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 shadow-2xl max-w-sm w-full mx-4">
        <Loader
          type={type}
          size="lg"
          text={text}
          className="flex-col space-x-0 space-y-3"
        />
      </div>
    </div>
  );
};

// Loader pour les boutons
export const ButtonLoader: React.FC<{
  type?: LoaderProps["type"];
  text?: string;
  size?: LoaderProps["size"];
}> = ({ type = "default", text, size = "sm" }) => {
  return <Loader type={type} size={size} text={text} />;
};

// Loader pour les sections de contenu
export const ContentLoader: React.FC<{
  text?: string;
  className?: string;
}> = ({ text = "Chargement du contenu...", className = "" }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 ${className}`}
    >
      <div className="relative">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-teal-400 rounded-full animate-spin animation-delay-150"></div>
      </div>
      <p className="mt-4 text-slate-600 font-medium">{text}</p>
      <div className="mt-2 flex space-x-1">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce animation-delay-100"></div>
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce animation-delay-200"></div>
      </div>
    </div>
  );
};

// Skeleton loader pour les cartes
export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-slate-200 rounded"></div>
        <div className="h-3 bg-slate-200 rounded w-5/6"></div>
        <div className="h-3 bg-slate-200 rounded w-4/6"></div>
      </div>
      <div className="mt-4 flex space-x-2">
        <div className="h-8 bg-slate-200 rounded w-20"></div>
        <div className="h-8 bg-slate-200 rounded w-16"></div>
      </div>
    </div>
  );
};

export default Loader;
