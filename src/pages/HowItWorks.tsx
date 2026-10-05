import {
  ArrowRight,
  ArrowUpRight,
  Handshake,
  Leaf,
  MapPin,
  Search,
  Sprout,
  Tractor,
  ChevronDown,
  Plus,
  CalendarDays,
} from "lucide-react";
import { images } from "../data";
import { PageLink, useRouter } from "../router";
import Reveal from "../components/Reveal";

const questions = [
  {
    title: "Can I rent equipment or buy it outright?",
    answer:
      "Both. Switch between Rent equipment and Buy equipment on the marketplace. Owners can list equipment for rent, for sale, or both. Every listing clearly shows its daily rental rate or purchase price.",
  },
  {
    title: "How do I find equipment near me?",
    answer:
      "Search by city, state abbreviation, or ZIP code, then narrow the results by category, condition, and price. Our preview includes sample equipment across Iowa; try Des Moines, Ames, or ZIP code 50023.",
  },
  {
    title: "How are pickup and delivery arranged?",
    answer:
      "Check the listing description, then discuss pickup or delivery directly with the owner. Transport, operating requirements, and availability should all be confirmed before your equipment gets to work.",
  },
  {
    title: "What do I need to create a listing?",
    answer:
      "Add the equipment name, category, condition, specifications, location, and your asking price. Choose whether you want to rent, sell, or do both, and describe what makes your equipment a good fit.",
  },
  {
    title: "Can I book or pay through this preview?",
    answer:
      "This version lets you explore equipment, save favorites, create local demo listings, and try the request forms. Requests are not sent to owners and payments are not processed. Your saved items and demo listings stay in this browser.",
  },
];
export default function HowItWorks({ onList }: { onList: () => void }) {
  const { navigate } = useRouter();
  return (
    <>
      <section className="hero page-width">
        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow">
            <span />
            ROOTED IN COMMUNITY. BUILT FOR YOU.
          </div>
          <h1>
            Good equipment.
            <br />
            Great{" "}
            <span className="heading-accent">
              possibilities.
              <svg
                viewBox="0 0 430 18"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M4 12 Q200 -4 425 8 M20 17 Q230 3 400 12" />
              </svg>
            </span>
          </h1>
          <p>
            The right tools for your land, without the heavy lift.
            <br className="desktop-break" /> Rent or buy farm equipment from
            people who get it.
          </p>
          <div className="hero-actions">
            <button
              className="button primary hero-button"
              onClick={() => navigate("marketplace")}
            >
              Find your equipment
              <ArrowUpRight size={19} />
            </button>
            <a className="text-link" href="#the-steps">
              See how it works
              <ArrowRight size={17} />
            </a>
          </div>
          <div className="hero-community">
            <div className="avatar-stack">
              <span>JM</span>
              <span>AL</span>
              <span>RK</span>
              <span>DS</span>
            </div>
            <div>
              <div className="mini-stars" aria-label="Five stars">
                ★★★★★
              </div>
              <span>Good neighbors. Better farming.</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <img
            className="hero-image"
            src={images.tractor}
            alt="Green farm tractor working a field under an open sky"
            fetchPriority="high"
          />
          <div className="hero-image-shade" />
          <div className="hero-location">
            <MapPin size={14} />A little closer to your next harvest.
          </div>
          <div className="hero-caption">
            <span>BIG IDEAS START WITH THE RIGHT TOOLS</span>
            <p>
              More growing.
              <br />
              Less holding you back.
            </p>
          </div>
          <div className="hero-floating">
            <span className="floating-icon">
              <Leaf size={23} />
            </span>
            <div>
              <strong>From one farmer to another.</strong>
              <span>That’s the Farmigo way.</span>
            </div>
            <ArrowUpRight size={19} />
          </div>
          <span className="hero-stamp">
            <Sprout size={25} />
            <span>
              LET’S GROW
              <br />
              TOGETHER
            </span>
          </span>
        </div>
      </section>
      <Reveal>
        <section className="how-section" id="the-steps">
          <div className="page-width">
            <div className="how-heading">
              <div>
                <span className="eyebrow">LESS FRICTION. MORE FIELDWORK.</span>
                <h2>
                  Your next good season,
                  <br />
                  in three simple steps.
                </h2>
              </div>
              <p>
                We make it easy to find what you need,
                <br className="desktop-break" /> and get back to what you do
                best.
              </p>
            </div>
            <div className="steps">
              <article>
                <span className="step-number">01</span>
                <div className="step-icon">
                  <Search size={25} />
                </div>
                <h3>Find your perfect fit.</h3>
                <p>
                  Explore equipment by category, location, and price. Find the
                  right tool for the job.
                </p>
              </article>
              <article>
                <span className="step-number">02</span>
                <div className="step-icon">
                  <Handshake size={25} />
                </div>
                <h3>Meet a good neighbor.</h3>
                <p>
                  Connect with the owner, ask your questions, and work out the
                  details together.
                </p>
              </article>
              <article>
                <span className="step-number">03</span>
                <div className="step-icon">
                  <Tractor size={25} />
                </div>
                <h3>Get out there and grow.</h3>
                <p>
                  Pick it up or arrange delivery. Put your equipment to work and
                  make things happen.
                </p>
              </article>
            </div>
          </div>
        </section>
      </Reveal>
      <Reveal>
        <section className="how-owner-section page-width">
          <div>
            <span className="eyebrow">HAVE EQUIPMENT TO SHARE?</span>
            <h2>
              Give a good tool
              <br />
              another good season.
            </h2>
            <p>
              Whether you’re renting out a tractor between jobs or selling an
              attachment you’ve outgrown, listing on Farmigo starts with a few
              simple details.
            </p>
            <button className="button primary" onClick={onList}>
              Create your listing
              <Plus size={17} />
            </button>
          </div>
          <div className="owner-steps">
            <article>
              <span>
                <Tractor size={20} />
              </span>
              <div>
                <h3>Tell its story.</h3>
                <p>Add its specs, condition, and a description.</p>
              </div>
            </article>
            <article>
              <span>
                <CalendarDays size={20} />
              </span>
              <div>
                <h3>Make it work for you.</h3>
                <p>Choose rent, sell, or both, and set your price.</p>
              </div>
            </article>
            <article>
              <span>
                <Handshake size={20} />
              </span>
              <div>
                <h3>Find the right neighbor.</h3>
                <p>Discuss the job, availability, and transport together.</p>
              </div>
            </article>
          </div>
        </section>
      </Reveal>
      <Reveal>
        <section className="faq-section page-width">
          <div className="faq-heading">
            <span className="eyebrow">A FEW THINGS YOU MIGHT BE WONDERING</span>
            <h2>
              Good questions.
              <br />
              Straightforward answers.
            </h2>
            <p>A little clarity before you head into the field.</p>
          </div>
          <div className="faq-list">
            {questions.map((question) => (
              <details key={question.title}>
                <summary>
                  {question.title}
                  <ChevronDown size={17} />
                </summary>
                <p>{question.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </Reveal>
      <Reveal>
        <section className="page-callout page-width">
          <span className="callout-icon">
            <Sprout size={29} />
          </span>
          <div>
            <h2>Let’s put a good season in motion.</h2>
            <p>The right equipment could be just down the road.</p>
          </div>
          <PageLink className="button primary" page="marketplace">
            Explore equipment
            <ArrowRight size={17} />
          </PageLink>
        </section>
      </Reveal>
    </>
  );
}
