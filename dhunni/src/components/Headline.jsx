import { useEffect, useState } from 'react';
import { useGetHeadlinesQuery } from '../../redux/api/headlineApi';

const Headline = () => {
    const [headlines, setHeadlines] = useState([]);
    const { data, isLoading } = useGetHeadlinesQuery();

    useEffect(() => {
        if (data?.data) {
            setHeadlines(data.data);
        }
    }, [data]);

    if (isLoading || headlines.length === 0) return null;

    // Sab headlines ko ek string mein join karo separator ke saath
    const combinedText = headlines.map(h => h.text).join("   ●   ");

    return (
        <div className="w-full overflow-hidden py-2 bg-white border-b border-gray">
            <div className="flex whitespace-nowrap animate-marquee">
                <span className="text-dark font-sans text-xs sm:text-sm px-8" dir="rtl">
                    {combinedText}
                </span>
                {/* Duplicate for seamless loop */}
                <span className="text-dark font-sans text-xs sm:text-sm px-8" dir="rtl">
                    {combinedText}
                </span>
            </div>
        </div>
    );
};

export default Headline;