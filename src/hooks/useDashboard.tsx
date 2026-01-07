import { useState } from 'react';
import useLinks from './useLinks';
import { useRouter } from 'next/navigation';
import BiopageEditor from '@/app/(app)/dashboard/biopageeditor';
import PremiumFeatures from '@/components/premiumfeatures';
import Stats from '@/components/stats';
import LinkManager from '@/features/links/components/LinkManager';

// Íconos
import { Link, BarChart, Layout, Flame, Home } from 'lucide-react';

export const useDashboard = () => {
  const [activeLink, setActiveLink] = useState<number | null>(1);
  const linkState = useLinks();
  const router = useRouter();

  const LINKS = [
    {
      index: 1,
      title: 'Links',
      icon: <Link size={18} />,
      action: () => setActiveLink(1),
    },
    {
      index: 2,
      title: 'Stats',
      icon: <BarChart size={18} />,
      action: () => setActiveLink(2),
    },
    {
      index: 3,
      title: 'BioPage',
      icon: <Layout size={18} />,
      action: () => setActiveLink(3),
    } /* {
            index: 0,
            title: "Profile",
            icon: <User size={18} />,
            action: () => setActiveLink(0),
        }, */,
    {
      index: 4,
      title: 'Get Premium ',
      icon: <Flame color="#ff5900" size={18} />,
      action: () => setActiveLink(4),
    },

    {
      index: 20,
      title: 'Back Home',
      icon: <Home size={18} />,
      color: 'text-blue-400',
      action: () => router.push('/'),
    },
  ];

  const SECTIONS: Record<number, React.ReactNode> = {
    /*   0: <Profile />, */
    1: <LinkManager linkState={linkState} />,
    2: <Stats links={linkState.links} />,
    3: <BiopageEditor />,
    4: (
      <div className="flex justify-center items-center gap-4 flex-wrap">
        <PremiumFeatures time={'mensual'} priceId={'pri_01jwryd6rgxfdh50rknhcqh1aq'} />
        <PremiumFeatures time={'anual'} priceId={'pri_01jwryfkyzp3jrbj7xw8hjp585'} />
      </div>
    ),
  };

  const renderButtons = () =>
    LINKS.map(({ index, title, icon, action, color }) => (
      <li key={index}>
        <button
          onClick={action}
          className={`
    flex items-center gap-2 w-full px-4 py-3 rounded-lg transition-all duration-200
    ${activeLink === index
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20'
              : 'text-gray-300 hover:bg-gray-700/70 hover:text-white'
            } 
    ${color ?? ''}
`}
        >
          <span>{icon}</span>
          <span className="hidden md:inline">{title}</span>
        </button>
      </li>
    ));

  const renderSection = (index: number) => {
    return SECTIONS[index!] || <p>Welcome to your dashboard!</p>;
  };

  return { activeLink, renderButtons, renderSection };
};
