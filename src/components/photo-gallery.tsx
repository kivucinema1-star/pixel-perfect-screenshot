import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type Photo = { id: string; photo_url: string };

function PhotoViewer({ photos, startIndex }: { photos: Photo[]; startIndex: number }) {
  const [viewportRef, carousel] = useEmblaCarousel({ loop: true, startIndex });
  const [current, setCurrent] = useState(startIndex);
  const [playing, setPlaying] = useState(true);
  const select = useCallback(() => {
    if (carousel) setCurrent(carousel.selectedScrollSnap());
  }, [carousel]);

  useEffect(() => {
    if (!carousel) return;
    select();
    carousel.on("select", select);
    return () => { carousel.off("select", select); };
  }, [carousel, select]);

  useEffect(() => {
    if (!carousel || !playing || photos.length < 2) return;
    const timer = setInterval(() => carousel.scrollNext(), 5000);
    return () => clearInterval(timer);
  }, [carousel, playing, current, photos.length]);

  return (
    <DialogContent
      aria-describedby={undefined}
      className="max-w-6xl gap-3 border-0 bg-background p-3 pt-12 sm:p-5 sm:pt-12"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") { event.preventDefault(); carousel?.scrollPrev(); }
        if (event.key === "ArrowRight") { event.preventDefault(); carousel?.scrollNext(); }
      }}
    >
      <DialogTitle className="sr-only">Gallery photos</DialogTitle>
      <div ref={viewportRef} className="overflow-hidden touch-pan-y">
        <div className="flex">
          {photos.map((photo, index) => (
            <div key={photo.id} className="min-w-0 flex-[0_0_100%]">
              <img
                src={photo.photo_url}
                alt={`Gallery photo ${index + 1}`}
                className="h-[65dvh] max-h-[800px] w-full object-contain"
                loading={index === startIndex ? "eager" : "lazy"}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" aria-label="Previous photo" title="Previous photo" disabled={photos.length < 2} onClick={() => carousel?.scrollPrev()}><ChevronLeft /></Button>
        <span className="min-w-16 text-center text-sm tabular-nums text-muted-foreground" aria-live="polite">{current + 1} / {photos.length}</span>
        <Button variant="ghost" size="icon" aria-label="Next photo" title="Next photo" disabled={photos.length < 2} onClick={() => carousel?.scrollNext()}><ChevronRight /></Button>
        {photos.length > 1 && <Button variant="ghost" size="icon" aria-label={playing ? "Pause slideshow" : "Play slideshow"} title={playing ? "Pause slideshow" : "Play slideshow"} onClick={() => setPlaying(!playing)}>{playing ? <Pause /> : <Play />}</Button>}
      </div>
    </DialogContent>
  );
}

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-5">
        {photos.map((photo, index) => (
          <Button
            key={photo.id}
            variant="ghost"
            className="group aspect-[4/3] h-auto w-full overflow-hidden rounded-lg bg-muted p-0"
            aria-label={`Open gallery photo ${index + 1}`}
            onClick={() => setSelected(index)}
          >
            <img src={photo.photo_url} alt={`Gallery photo ${index + 1}`} loading="lazy" className="h-full w-full object-contain" />
          </Button>
        ))}
      </div>
      {selected !== null && <PhotoViewer key={selected} photos={photos} startIndex={selected} />}
    </Dialog>
  );
}