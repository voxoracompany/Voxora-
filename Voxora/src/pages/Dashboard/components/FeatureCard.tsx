import { memo } from "react";
import "./FeatureCard.css";

type FeatureCardProps = {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
};

const FeatureCard = memo(function FeatureCard({ title, description, buttonText, onClick }: FeatureCardProps) {
  return (
    <div className="feature-card">
      <h3 className="feature-card-title">{title}</h3>
      <p className="feature-card-desc">{description}</p>
      <button className="feature-card-btn" onClick={onClick}>{buttonText}</button>
    </div>
  );
});

export default FeatureCard;
