import { useState } from "react";
import { ChevronLeft, ChevronRight, Expand, Tractor } from "lucide-react";
import Modal from "./Modal";
export function Photo({
  src,
  alt,
  className = "",
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div
      className={`image-placeholder ${className}`}
      role="img"
      aria-label={`${alt}: image unavailable`}
    >
      <Tractor size={35} />
      <span>Photo unavailable</span>
    </div>
  ) : (
    <img
      {...props}
      className={className}
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
    />
  );
}
export default function PhotoGallery({
  photos,
  title,
}: {
  photos: string[];
  title: string;
}) {
  const [index, setIndex] = useState(0),
    [expanded, setExpanded] = useState(false);
  const move = (delta: number) =>
    setIndex((i) => (i + delta + photos.length) % photos.length);
  return (
    <>
      <div className="gallery">
        <div
          className="gallery-stage"
          tabIndex={0}
          aria-label="Equipment photo gallery"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              move(-1);
            }
            if (e.key === "ArrowRight") {
              e.preventDefault();
              move(1);
            }
          }}
        >
          <Photo
            key={photos[index]}
            src={photos[index]}
            alt={`${title}, photo ${index + 1}`}
          />
          {photos.length > 1 && (
            <>
              <button
                className="gallery-prev"
                aria-label="Previous photo"
                onClick={() => move(-1)}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                className="gallery-next"
                aria-label="Next photo"
                onClick={() => move(1)}
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
          <button className="gallery-expand" onClick={() => setExpanded(true)}>
            <Expand size={15} />
            View photo
          </button>
          <span className="gallery-count">
            {index + 1} / {photos.length}
          </span>
        </div>
        <div className="gallery-thumbs">
          {photos.map((photo, i) => (
            <button
              key={`${photo}-${i}`}
              className={index === i ? "selected" : ""}
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={index === i}
              onClick={() => setIndex(i)}
            >
              <Photo src={photo} alt={`${title}, thumbnail ${i + 1}`} />
            </button>
          ))}
        </div>
      </div>
      {expanded && (
        <Modal
          title={`${title} — photo ${index + 1}`}
          close={() => setExpanded(false)}
          wide
        >
          <Photo
            key={photos[index]}
            src={photos[index]}
            alt={`${title}, enlarged photo ${index + 1}`}
            className="expanded-photo"
          />
        </Modal>
      )}
    </>
  );
}
