import { useEffect, useMemo, useRef, useState } from "react";
import { facilities, gallery, hotel, rooms } from "./content.js";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

function Tilt({ className, children }) {
  const ref = useRef(null);

  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  const move = (event) => {
    const node = ref.current;
    if (!node) return;
    const box = node.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    node.style.transform = `perspective(1100px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg) translate3d(0, -6px, 16px)`;
  };

  return (
    <div ref={ref} className={`tilt ${className || ""}`} onMouseMove={move} onMouseLeave={reset}>
      {children}
    </div>
  );
}

function Lightbox({ item, onClose, onPrev, onNext }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onNext();
      if (event.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNext, onPrev]);

  if (!item) return null;

  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true">
      <button className="lb-x" type="button" onClick={onClose} aria-label="Close gallery">
        Close
      </button>
      <button
        className="lb-nav prev"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
      >
        Prev
      </button>
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={item.src} alt={item.alt} />
        <figcaption>{item.label}</figcaption>
      </figure>
      <button
        className="lb-nav next"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
      >
        Next
      </button>
    </div>
  );
}

export default function Home({ theme, onToggleTheme }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lightIndex, setLightIndex] = useState(-1);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    guests: "2",
    roomType: "Family Room",
    message: "",
  });
  const [status, setStatus] = useState("idle");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const mapsSrc = useMemo(
    () =>
      "https://www.google.com/maps?q=Hotel%20Shyam%20Residency%2C%20Joshiyara%2C%20Uttarkashi%2C%20Uttarakhand%20249193&z=16&output=embed",
    []
  );

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setFeedback("");
    try {
      const response = await fetch(`${API}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          guests: Number(form.guests),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not send enquiry.");
      setStatus("success");
      setFeedback(data.message);
      setForm((prev) => ({ ...prev, message: "" }));
    } catch (error) {
      setStatus("error");
      setFeedback(error.message || "Network error. Please call us.");
    }
  };

  const lightItem = lightIndex >= 0 ? gallery[lightIndex] : null;

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="orb orb-a" aria-hidden="true" />
      <div className="orb orb-b" aria-hidden="true" />

      <header className={`nav ${scrolled ? "is-solid" : ""}`}>
        <a className="brand" href="#top">
          <span className="brand-mark">SR</span>
          <span>
            Shyam Residency
            <small>Uttarkashi</small>
          </span>
        </a>
        <nav className={`links ${open ? "open" : ""}`}>
          <a href="#about" onClick={() => setOpen(false)}>Stay</a>
          <a href="#rooms" onClick={() => setOpen(false)}>Rooms</a>
          <a href="#gallery" onClick={() => setOpen(false)}>Gallery</a>
          <a href="#dham" onClick={() => setOpen(false)}>Char Dham</a>
          <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
        </nav>
        <div className="nav-end">
          <button className="ghost" type="button" onClick={onToggleTheme}>
            {theme === "dark" ? "Day" : "Night"}
          </button>
          <a className="pill" href="#book">
            Enquire
          </a>
          <button className="menu" type="button" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            <span />
            <span />
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-frame">
            <img
              className="hero-photo"
              src="/images/main.jpg"
              alt="Hotel Shyam Residency front exterior in Uttarkashi"
            />
            <div className="hero-veil" />
            <p className="spine">Bhagirathi · Motar Pull · 249193</p>
            <div className="hero-copy">
              <p className="kicker">A house on the river road</p>
              <h1>
                Hotel Shyam
                <em>Residency</em>
              </h1>
              <p className="lede">
                Eighteen rooms in Joshiyara — close to Motar Pull, looking toward
                the hills, for pilgrims and travellers who want a real bed, a parked
                car, and a quiet night before Gangotri.
              </p>
              <div className="hero-actions">
                <a className="pill" href="#book">
                  Request a room
                </a>
                <a className="text-link" href="#rooms">
                  See the rooms
                </a>
              </div>
            </div>
            <div className="hero-meta">
              <div>
                <strong>18</strong>
                <span>Rooms</span>
              </div>
              <div>
                <strong>12</strong>
                <span>Family</span>
              </div>
              <div>
                <strong>6</strong>
                <span>Deluxe</span>
              </div>
            </div>
          </div>
          <div className="film">
            {[
              ["/images/room-panorama.jpg", "Rooms with mountain windows"],
              ["/images/river-bridge.jpg", "Bhagirathi and the iron bridge"],
              ["/images/parking-river.jpg", "Night parking by the water"],
              ["/images/room-double.jpg", "The double room"],
            ].map(([src, alt]) => (
              <img key={src} src={src} alt={alt} />
            ))}
          </div>
        </section>

        <section id="about" className="section split">
          <div className="section-index">01 — The house</div>
          <div>
            <p className="kicker">About the hotel</p>
            <h2>Built for the night before the high road.</h2>
            <p>
              Hotel Shyam Residency sits near Motar Pull in Joshiyara, Uttarkashi —
              a practical, well-kept stay rather than a resort fantasy. The building
              is lit, the rooms are large, the bathrooms are tiled and hot, and the
              river is close enough that you hear it when the town goes quiet.
            </p>
            <p>
              Families take the quad rooms. Trekking parties take the triples. One
              double remains for two people who want the smallest, stillest room in
              the house. Homely food is cooked at an affordable price. Parking is
              free. Wi-Fi is free. The rest is sleep, tea, and the morning drive.
            </p>
            <ul className="facts">
              <li>Near Motar Pull / Joshiyara</li>
              <li>Uttarkashi, Uttarakhand 249193</li>
              <li>18 rooms across two layouts</li>
            </ul>
          </div>
          <Tilt className="photo-stack">
            <img src="/images/hotel-night.jpg" alt="Night façade and parking around the hotel" />
            <img src="/images/bathroom.jpg" alt="Hotel bathroom with geyser and shower" />
          </Tilt>
        </section>

        <section id="rooms" className="section">
          <div className="section-index">02 — Sleeping</div>
          <div className="section-head">
            <div>
              <p className="kicker">Rooms</p>
              <h2>Three kinds of rest. Nothing invented.</h2>
            </div>
            <p className="aside">
              Ask for a higher floor if you want the longer view. Photographs are of
              this property — the same windows, the same beds, the same night lighting.
            </p>
          </div>
          <div className="room-grid">
            {rooms.map((room) => (
              <Tilt key={room.type} className="room-card">
                <div className="room-photo">
                  <img src={room.image} alt={room.type} />
                  <span>{room.count} in house</span>
                </div>
                <div className="room-body">
                  <h3>{room.type}</h3>
                  <p className="sleeps">{room.sleeps}</p>
                  <p>{room.copy}</p>
                  <a href="#book">Enquire for {room.type}</a>
                </div>
              </Tilt>
            ))}
          </div>
        </section>

        <section id="facilities" className="section">
          <div className="section-index">03 — The stay</div>
          <div className="section-head">
            <div>
              <p className="kicker">Facilities</p>
              <h2>What is actually here.</h2>
            </div>
          </div>
          <div className="facility-grid">
            {facilities.map((item) => (
              <article key={item.title} className="glass">
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="river" className="cinematic">
          <img src="/images/river-bridge.jpg" alt="Steel bridge over green river water with Himalayan hills" />
          <div className="cine-copy">
            <p className="kicker">Riverfront</p>
            <h2>The Bhagirathi is the reason this town exists.</h2>
            <p>
              From the rooms you look across roofs toward the hills. From the
              parking you stand by the water and the night lights of Uttarkashi.
              Boating and kayaking run with the season — we will tell you what is
              open when you arrive.
            </p>
          </div>
        </section>

        <section id="exterior" className="section split reverse">
          <div className="section-index">04 — Arrival</div>
          <div>
            <p className="kicker">Exterior & parking</p>
            <h2>Drive in. Leave the car. That is the luxury here.</h2>
            <p>
              Free parking sits in the courtyard and along the river fence — space
              for family cars, Fortuners, and the white traveller vans that work
              this road. At night the building is a pale lantern against the hill.
              You do not hunt for a slot in the bazaar.
            </p>
          </div>
          <div className="duo">
            <img src="/images/parking-courtyard.jpg" alt="Courtyard parking seen from the hotel" />
            <img src="/images/parking-river.jpg" alt="Cars parked beside the river at night" />
          </div>
        </section>

        <section id="gallery" className="section">
          <div className="section-index">05 — Still frames</div>
          <div className="section-head">
            <div>
              <p className="kicker">Gallery</p>
              <h2>The building, the rooms, the water.</h2>
            </div>
          </div>
          <div className="masonry">
            {gallery.map((item, index) => (
              <button
                key={item.src}
                type="button"
                className="shot"
                onClick={() => setLightIndex(index)}
              >
                <img src={item.src} alt={item.alt} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section id="dham" className="section dham">
          <div className="section-index">06 — The road</div>
          <div className="dham-panel">
            <div>
              <p className="kicker">Gangotri & Char Dham</p>
              <h2>Uttarkashi is the last easy night.</h2>
              <p>
                Pilgrims use this town as a pause before Gangotri — and as a return
                point when the high road has done its work. Yamunotri, Gangotri,
                Kedarnath and Badrinath are the four dhams; this hotel is not on a
                temple courtyard. It is a clean base in Joshiyara, with parking,
                food, and a river you can walk to before the next climb.
              </p>
              <p>
                Tell us your yatra dates when you enquire. We hold rooms simply:
                pending, then confirmed by phone or WhatsApp.
              </p>
            </div>
            <img src="/images/room-panorama.jpg" alt="Mountain view from a guest room" />
          </div>
        </section>

        <section id="location" className="section">
          <div className="section-index">07 — Place</div>
          <div className="section-head">
            <div>
              <p className="kicker">Location</p>
              <h2>Near Motar Pull, Joshiyara.</h2>
              <p>{hotel.address}</p>
            </div>
          </div>
          <div className="map-wrap">
            <iframe title="Map of Hotel Shyam Residency, Uttarkashi" src={mapsSrc} loading="lazy" />
          </div>
        </section>

        <section id="contact" className="section split">
          <div className="section-index">08 — Reach us</div>
          <div>
            <p className="kicker">Contact</p>
            <h2>Call, message, or write.</h2>
            <div className="contact-list">
              <a href="tel:7579057800">7579057800</a>
              <a href="tel:8755905594">8755905594</a>
              <a href="https://wa.me/917579057800" target="_blank" rel="noreferrer">
                WhatsApp 7579057800
              </a>
              <a href="mailto:shyamresidencyuttarkashi@gmail.com">
                shyamresidencyuttarkashi@gmail.com
              </a>
            </div>
          </div>
          <form id="book" className="book glass" onSubmit={submit}>
            <p className="kicker">Booking enquiry</p>
            <h3>Hold a night on the river.</h3>
            <label>
              Name
              <input required value={form.name} onChange={setField("name")} name="name" autoComplete="name" />
            </label>
            <label>
              Phone
              <input required value={form.phone} onChange={setField("phone")} name="phone" autoComplete="tel" />
            </label>
            <div className="two">
              <label>
                Check-in
                <input required type="date" value={form.checkIn} onChange={setField("checkIn")} name="checkIn" />
              </label>
              <label>
                Check-out
                <input required type="date" value={form.checkOut} onChange={setField("checkOut")} name="checkOut" />
              </label>
            </div>
            <div className="two">
              <label>
                Guests
                <input
                  required
                  type="number"
                  min="1"
                  max="20"
                  value={form.guests}
                  onChange={setField("guests")}
                  name="guests"
                />
              </label>
              <label>
                Room type
                <select value={form.roomType} onChange={setField("roomType")} name="roomType">
                  <option>Family Room</option>
                  <option>Deluxe Room</option>
                </select>
              </label>
            </div>
            <label>
              Message
              <textarea rows="3" value={form.message} onChange={setField("message")} name="message" />
            </label>
            <button className="pill" type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Sending…" : "Send enquiry"}
            </button>
            {feedback && <p className={`form-note ${status}`}>{feedback}</p>}
          </form>
        </section>
      </main>

      <footer className="foot">
        <div>
          <strong>Hotel Shyam Residency</strong>
          <p>{hotel.address}</p>
        </div>
        <div>
          <a href="/admin">Staff desk</a>
          <a href="https://wa.me/917579057800">WhatsApp</a>
        </div>
        <p className="fine">A stay in Joshiyara. No invented awards, no borrowed photographs.</p>
      </footer>

      <Lightbox
        item={lightItem}
        onClose={() => setLightIndex(-1)}
        onPrev={() => setLightIndex((i) => (i <= 0 ? gallery.length - 1 : i - 1))}
        onNext={() => setLightIndex((i) => (i + 1) % gallery.length)}
      />
    </>
  );
}
