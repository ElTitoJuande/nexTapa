// ItemGallery.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemService } from '../../services/itemService.js';

const DEFAULT_IMAGE = 'https://placehold.co/400x400/f5f5f0/a3a3a3?text=🍽️';

export const ItemGallery = ({ establishmentId }) => {
   const [items, setItems] = useState([]);
   const [loading, setLoading] = useState(true);
   const navigate = useNavigate();

   useEffect(() => {
      const fetchItems = async () => {
         try {
            const response = await itemService.getByEstablishment(establishmentId, {
               available: true
            });
            setItems(response.data);
         } catch (err) {
            console.error('Error al cargar galería:', err);
         } finally {
            setLoading(false);
         }
      };
      if (establishmentId) {fetchItems();}
   }, [establishmentId]);

   if (loading) {return null;}
   if (items.length === 0) {return null;}

   return (
      <div className="flex gap-3 mt-3  
    overflow-x-auto pb-4
    snap-x snap-mandatory

    
    [&::-webkit-scrollbar]:h-2
    [&::-webkit-scrollbar-track]:bg-neutral-100
    [&::-webkit-scrollbar-track]:rounded-full
    [&::-webkit-scrollbar-thumb]:bg-neutral-300
    [&::-webkit-scrollbar-thumb]:rounded-full
    
    /* 3. Firefox Support */
    [scrollbar-width:thin]
    [scrollbar-color:#d4d4d4_#f5f5f5]
  ">
         {items.map((item) => (
            <button
               key={item._id}
               onClick={() => navigate(`/items/${item._id}`)}
               className="
          group relative 
          flex-none 
          w-[45%] md:w-[calc(25%-12px)] 
          snap-start
          aspect-square
          overflow-hidden rounded-xl bg-neutral-100
        "
            >
               <img
                  src={item.mainImage || DEFAULT_IMAGE}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE; }}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <p className="text-white text-[10px] md:text-xs font-medium p-2 md:p-3 line-clamp-1 w-full text-left">
                     {item.name}
                  </p>
               </div>
            </button>
         ))}
      </div>
   );
};