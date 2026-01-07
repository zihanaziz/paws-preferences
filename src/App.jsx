import { createRef, useEffect, useMemo, useRef, useState } from "react";
import TinderCard from "react-tinder-card";
import "./App.css";

const CAT_COUNT = 15;

function buildCatImageUrl(id, cb) {
  return `https://cataas.com/cat/${id}?width=420&height=560&cb=${cb}`;
}

async function fetchCats(limit = CAT_COUNT, skip = 0) {
  const res = await fetch(`https://cataas.com/api/cats?limit=${limit}&skip=${skip}`);
  if (!res.ok) throw new Error("Failed to fetch cats");
  const data = await res.json();

  const cb = Date.now(); // cache-buster image tak cache
  return data.slice(0, limit).map((c) => ({
    id: c.id,
    url: buildCatImageUrl(c.id, cb),
  }));
}


function preloadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve; 
    img.src = url;
  });
}

export default function App() {
  const [cats, setCats] = useState([]);
  const [liked, setLiked] = useState([]);
  const [dislikedCount, setDislikedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState(null);
  const flashTimerRef = useRef(null);

  const flashScreen = (type) => {
    setFlash(type);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setFlash(null), 220);
  };

  

  const [currentIndex, setCurrentIndex] = useState(-1);
  const currentIndexRef = useRef(-1);

  const childRefs = useMemo(
    () => Array(cats.length).fill(0).map(() => createRef()),
    [cats.length]
  );

  const updateCurrentIndex = (val) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await fetchCats(CAT_COUNT);
  
        // preload cats first bfr show
        await Promise.all(list.map((c) => preloadImage(c.url)));
  
        setCats(list);
        setLiked([]);
        setDislikedCount(0);
        updateCurrentIndex(list.length - 1);
      } catch (e) {
        console.error(e);
        alert("Could not load cats. Check internet / Cataas.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  

  const handleSwipe = (direction, cat, index) => {
    if (direction === "right") {
      setLiked((prev) => [...prev, cat]);
      flashScreen("like");
    }
    if (direction === "left") {
      setDislikedCount((prev) => prev + 1);
      flashScreen("nope");
    }
    updateCurrentIndex(index - 1);
  };
  

  const swipe = async (dir) => {
    const i = currentIndexRef.current;
    if (i < 0) return;
    const ref = childRefs[i];
    if (ref?.current) await ref.current.swipe(dir);
  };

  const reset = async () => {
    try {
      setLoading(true);
  
      const randomSkip = Math.floor(Math.random() * 1000); 
      let list = await fetchCats(CAT_COUNT, randomSkip);
  
      // fallback 
      if (list.length < CAT_COUNT) list = await fetchCats(CAT_COUNT, 0);
  
      await Promise.all(list.map((c) => preloadImage(c.url)));
  
      setCats(list);
      setLiked([]);
      setDislikedCount(0);
      updateCurrentIndex(list.length - 1);
    } finally {
      setLoading(false);
    }
  };
  

  const finished = !loading && cats.length > 0 && currentIndex < 0;

  useEffect(() => {
    const cls = "swipe-lock";
    if (!finished) document.body.classList.add(cls);
    else document.body.classList.remove(cls);
  
    return () => document.body.classList.remove(cls);
  }, [finished]);
  

  return (
    <div className="page">
      <div className={`screenFlash ${flash ? flash : ""}`} aria-hidden="true" />
      <header className="topbar">
        <div className="title">Paws & Preferences</div>
        <div className="sub">Swipe right = Like • Swipe left = Dislike</div>
      </header>

      {loading && (
        <div className="status">
          <div className="catLoader" aria-label="Loading cats">
            <span className="catDot" aria-hidden="true">🐱</span>
            <span className="catDot" aria-hidden="true">🐱</span>
            <span className="catDot" aria-hidden="true">🐱</span>
            <span className="srOnly">Loading cats…</span>
          </div>
        </div>
      )}


      {!loading && cats.length > 0 && !finished && (
        <>
          <div className="cardArea">
            {cats.map((cat, index) => (
              <TinderCard
                ref={childRefs[index]}
                className="swipe"
                key={cat.id}
                preventSwipe={["up", "down"]}
                onSwipe={(dir) => handleSwipe(dir, cat, index)}
                swipeRequirementType="velocity"
                swipeThreshold={0.25}
                flickOnSwipe={true}
              >
                <div className="card" style={{ backgroundImage: `url(${cat.url})` }}>
                </div>
              </TinderCard>
            ))}
          </div>

          <div className="buttons">
            <button className="btn dislike" onClick={() => swipe("left")}>
              ✕ Dislike
            </button>
            <button className="btn like" onClick={() => swipe("right")}>
              ♥ Like
            </button>
          </div>

          <div className="progress">
            Remaining: {Math.max(currentIndex + 1, 0)} • Liked: {liked.length} • Disliked:{" "}
            {dislikedCount}
          </div>
        </>
      )}

      {finished && (
        <div className="summary">
          <h2>Summary</h2>
          <p>
            You liked <b>{liked.length}</b> out of <b>{cats.length}</b> cats.
          </p>

          {liked.length === 0 ? (
            <p>No likes this round 😿</p>
          ) : (
            <div className="grid">
              {liked.map((cat) => (
                <img key={cat.id} className="thumb" src={cat.url} alt="Liked cat" />
              ))}
            </div>
          )}

          <button className="btn restart" onClick={reset}>
            Start again
          </button>
        </div>
      )}
    </div>
  );
}
