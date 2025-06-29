import React from 'react';

interface ResponseCardProps {
  title: string;
  content: string;
  icon: React.ReactNode;
  gradient: string;
}

const ResponseCard: React.FC<ResponseCardProps> = ({ title, content, icon, gradient }) => {
  return (
    <div className={`bg-gradient-to-r ${gradient} backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300`}>
      <div className="flex items-center space-x-3 mb-4">
        {icon}
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>
      
      <div className="text-blue-100 leading-relaxed whitespace-pre-line">
        {content}
      </div>
    </div>
  );
};

export default ResponseCard;