import dynamic from 'next/dynamic';

export const Chart = dynamic(() => import('react-apexcharts'), {ssr: false});

// export {default as Chart} from 'react-apexcharts';
