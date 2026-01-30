import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitCompare, X } from 'lucide-react';
import { useComparisonStore } from '@/stores/comparisonStore';
import { Button } from '@admitly/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { ComparisonItem } from './ComparisonItem';

export const ComparisonTray: FC = () => {
  const navigate = useNavigate();
  const { items, clear } = useComparisonStore();

  const handleViewComparison = () => {
    navigate('/compare');
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50"
        data-testid="comparison-tray"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Comparison Tray ({items.length}/3)</h3>
              <div className="flex flex-wrap gap-2">
                {items.map(item => (
                  <ComparisonItem key={item.id} id={item.id} type={item.type} />
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              <Button
                onClick={handleViewComparison}
                disabled={items.length < 2}
              >
                <GitCompare className="h-4 w-4 mr-2" />
                Compare ({items.length})
              </Button>
              <Button
                variant="outline"
                onClick={() => clear()}
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

ComparisonTray.displayName = 'ComparisonTray';
