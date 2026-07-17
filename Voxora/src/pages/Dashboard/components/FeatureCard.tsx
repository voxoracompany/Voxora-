type FeatureCardProps = {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
};

const FeatureCard = ({
  title,
  description,
  buttonText,
  onClick,
}: FeatureCardProps) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{description}</p>

      <button className="card-button" onClick={onClick}>
        {buttonText}
      </button>
    </div>
  );
};

export default FeatureCard;