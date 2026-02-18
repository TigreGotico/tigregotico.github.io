import { motion } from 'framer-motion';
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-subtle">
      <motion.div
        className="text-center max-w-md mx-auto px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="mb-8"
          variants={itemVariants}
        >
          <motion.div
            className="w-16 h-0.5 bg-primary mx-auto mb-4"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          ></motion.div>
          <motion.div
            className="w-8 h-0.5 bg-primary/60 mx-auto"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          ></motion.div>
        </motion.div>

        <motion.h1
          className="mb-6 text-6xl md:text-8xl font-serif font-bold text-foreground tracking-tight"
          variants={itemVariants}
        >
          404
        </motion.h1>

        <motion.p
          className="mb-8 text-xl text-muted-foreground font-light tracking-wide"
          variants={itemVariants}
        >
          Oops! Page not found
        </motion.p>

        <motion.p
          className="mb-8 text-sm text-muted-foreground font-light"
          variants={itemVariants}
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          variants={itemVariants}
        >
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Link to="/">
              <Button className="bg-gradient-primary hover:opacity-90 text-white px-6 py-3 font-medium tracking-wide shadow-gothic">
                <Home className="mr-2 w-4 h-4" />
                Return to Home
              </Button>
            </Link>
          </motion.div>

          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="px-6 py-3 font-medium tracking-wide"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Go Back
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-12"
          variants={itemVariants}
        >
          <motion.div
            className="w-24 h-0.5 bg-primary/30 mx-auto"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          ></motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
