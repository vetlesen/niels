"use client"
import { useState, useEffect } from "react";
import { getWork } from "../queries/getWork";
import MuxPlayer from "@mux/mux-player-react";

export default function Home() {
  const [work, setWork] = useState([]);
  const [filteredWork, setFilteredWork] = useState([]);
  const [activeFilter, setActiveFilter] = useState('both');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWork() {
      try {
        const workData = await getWork();
        setWork(workData);
        setFilteredWork(workData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching work:', error);
        setLoading(false);
      }
    }
    
    fetchWork();
  }, []);

  const filterWork = (category) => {
    setActiveFilter(category);
    if (category === 'both') {
      setFilteredWork(work);
    } else {
      setFilteredWork(work.filter(item => item.category === category));
    }
  };

  return (
    <main>
      <section className="h-[50svh] flex justify-start items-center px-4">
        <div className="space-x-5">
          <button 
            onClick={() => filterWork('both')}
            className={`px-4 py-2 rounded ${activeFilter === 'both' ? 'bg-black text-white' : 'bg-gray-200'}`}
          >
            Both
          </button>
          <button 
            onClick={() => filterWork('narrative')}
            className={`px-4 py-2 rounded ${activeFilter === 'narrative' ? 'bg-black text-white' : 'bg-gray-200'}`}
          >
            Narrative
          </button>
          <button 
            onClick={() => filterWork('commercial')}
            className={`px-4 py-2 rounded ${activeFilter === 'commercial' ? 'bg-black text-white' : 'bg-gray-200'}`}
          >
            Commercial
          </button>

        </div>
      </section>

      {/* DISPLAY THE WORK HERE */}
      <section className="px-4 pb-8">
        {loading ? (
          <p>Loading work...</p>
        ) : (
          <div className="">
            {filteredWork.map((item) => (
              <div key={item._id} className="flex flex-row space-x-4">
                {item.video?.asset?.playbackId && (
                  <MuxPlayer
                    playbackId={item.video.asset.playbackId}
                    controls
                    style={{ width: '300px', height: '200px' }}
                  />
                )}
                  <h3 className="">{item.name}</h3>
                  <h4 className="">{item.title}</h4>
                  <p className="text-gray-600">{item.type}</p>
                  <p className="text-gray-600">{item.year}</p>
                  <p className="text-gray-600">
                      {item.category}
                  </p>
                   <p className="text-gray-600">
                      1:39
                  </p>
              </div>
            ))}
          </div>
        )}
        
        {!loading && filteredWork.length === 0 && (
          <p className="text-gray-500 text-center">No work found for the selected category.</p>
        )}
      </section>
    </main>
  );
}
