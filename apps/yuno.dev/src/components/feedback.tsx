import { Link } from "teul/client";

type FeedbackButton = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

type FeedbackProps = {
  icon: string;
  title: string;
  description: string;
  buttons: FeedbackButton[];
};

export function Feedback({ icon, title, description, buttons }: FeedbackProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
      <div className="text-center">
        <div className="text-6xl md:text-7xl mb-8" animate-bounce>
          {icon}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
          {title}
        </h1>
        <p className="text-base md:text-lg text-gray-600 mb-8">{description}</p>
        {buttons.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {buttons.map((button) => (
              <Link
                key={button.href}
                to={button.href}
                className={
                  button.variant === "secondary"
                    ? "px-6 py-2.5 border border-gray-300 rounded-md font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors"
                    : "px-6 py-2.5 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
                }
              >
                {button.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
