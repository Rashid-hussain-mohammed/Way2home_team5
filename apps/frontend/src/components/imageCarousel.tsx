import React, { useState } from "react";

const ImageCarousel = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      {/* Left Side Carousel */}
      <div style={{ position: "relative", width: "70%" }}>
        <img
          src={images[currentIndex]}
          alt={`Slide ${currentIndex}`}
          style={{ width: "100%", height: "450px", objectFit: "cover", borderRadius: "8px" }}
        />
        <button
          onClick={handlePrev}
          style={{
            position: "absolute",
            top: "50%",
            left: "10px",
            transform: "translateY(-50%)",
            background: "rgba(0, 0, 0, 0.5)",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            padding: "10px",
            cursor: "pointer",
          }}
        >
          {"<"}
        </button>
        <button
          onClick={handleNext}
          style={{
            position: "absolute",
            top: "50%",
            right: "10px",
            transform: "translateY(-50%)",
            background: "rgba(0, 0, 0, 0.5)",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            padding: "10px",
            cursor: "pointer",
          }}
        >
          {">"}
        </button>
      </div>

      {/* Right Side Thumbnails */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "25%" }}>
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Thumbnail ${index}`}
            onClick={() => handleThumbnailClick(index)}
            style={{
              width: "100%",
              height: "90px",
              objectFit: "cover",
              borderRadius: "8px",
              cursor: "pointer",
              border: currentIndex === index ? "2px solid #007BFF" : "2px solid transparent",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;

export {}