import Carousel from "@/components/carousel";
export default function Home() {
  const carouselData = [
    {
      title: "Top Listings",
      images: ["/ls1.jpg", "/ls2.jpg", "/ls3.jpg"],
      interval: 10000
    },
    {
      title: "Featured Listings",
      images: ["/ls4.jpg", "/ls5.jpg", "/ls6.jpg"],
      interval: 8000
    },
    {
      title: "New Listings",
      images: ["/ls1.jpg", "/ls2.jpg", "/ls3.jpg"],
      interval: 12000
    },
    {
      title: "Popular Listings",
      images: ["/ls4.jpg", "/ls5.jpg", "/ls6.jpg"],
      interval: 9000
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-4 p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white to-gray-200">
      <div className="col-span-4 md:col-span-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
          {carouselData.map((carousel, index) => (
            <div key={index} className="mb-8">
              <h1 className="text-xl m-2 text-black-500">{carousel.title}</h1>
              <Carousel 
                images={carousel.images} 
                autoSlide={true} 
                autoSlideInterval={carousel.interval} 
              />
            </div>
          ))}
        </div>
      </div>
      <div className="hidden md:block border shadow py-3 px-2">
        {/* <Divider className="my-2"/> */}
        <hr className="my-2" />
      </div>
    </div>
  );
}
