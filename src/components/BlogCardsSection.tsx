import { MoveRight } from "lucide-react";
import { Button, type ButtonProps } from "./Button";

type Content = {
  title: string;
  button?: (ButtonProps & {
    text?: string;
    icon?: React.ReactNode;
  });
  articles: {
    id: string;
    title: string;
    description: string;
    imageAlt: string;
  }[];
};

const content: Content = {
  title: "Latest articles",
  button: {
    text: "View all articles",
    icon: <MoveRight className="xdgad" />
  },
  articles: [
    {
      id: "1",
      title: "Exploring the Future of Web Design",
      description: "Discover how emerging technologies are reshaping the digital landscape.",
      imageAlt: "Future of Web Design"
    },
    {
      id: "2",
      title: "10 Essential UI Design Trends for 2024",
      description: "Stay ahead of the curve with these cutting-edge design principles.",
      imageAlt: "UI Design Trends"
    },
    {
      id: "3",
      title: "Mastering React: Advanced Techniques for Building Scalable Apps",
      description: "Learn how to optimize your React applications for better performance and maintainability.",
      imageAlt: "React Advanced Techniques"
    }
  ]
} as const;

type BlogCardsSectionProps = React.ComponentPropsWithoutRef<"section"> & Partial<Content>;  

export const BlogCardsSection = (props: BlogCardsSectionProps) => {
  const { title, articles, button } = {
    ...content,
    ...props
  };

  return (
  <section className="z1w33">
    <div className="zyr0b">
      <header className="fu24a">
        <h2 className="rlowp">
          {title}
        </h2>
        {button && (
          <Button className="gap-4 text-xs !text-white rounded-full inline-flex items-center">
            {button.text} {button.icon}
          </Button>
        )}
      </header>
      <div className="mlalp">
        {articles?.map((article) => (
          <article id={article.id} key={article.id} className="h4srz">
            <div 
              className="kjh33"
              role="img"
              aria-label={article.imageAlt}></div>
            <h3 className="wadnd">{article.title}</h3>
            <p className="b42bj">
              {article.description}
            </p>
          </article>
        ))}
        </div>
      </div>
    </section>
  );
};