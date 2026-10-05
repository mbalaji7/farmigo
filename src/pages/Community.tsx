import {
  ArrowRight,
  Check,
  Handshake,
  Leaf,
  Sprout,
  Plus,
  Users,
  MapPin,
} from "lucide-react";
import { images } from "../data";
import { PageLink } from "../router";
import Reveal from "../components/Reveal";

export default function Community({ onList }: { onList: () => void }) {
  return (
    <>
      <section className="community-intro page-width">
        <span className="eyebrow">ROOTED IN COMMUNITY. BUILT FOR YOU.</span>
        <h1>
          Good neighbors.
          <br />
          <span className="heading-accent">Better farming.</span>
        </h1>
        <p>
          Behind every good season is a little help from someone who gets it.
          <br className="desktop-break" /> Farmigo brings the tools, and the
          people, a little closer together.
        </p>
        <div className="community-intro-note">
          <Sprout size={16} />
          For the people who keep us growing.
        </div>
      </section>
      <Reveal>
        <section className="community-principles page-width">
          <article>
            <span>
              <MapPin size={23} />
            </span>
            <h2>A little closer to home.</h2>
            <p>
              Find equipment in your area and connect with the farmers who know
              your land, your seasons, and your way of working.
            </p>
          </article>
          <article>
            <span>
              <Handshake size={23} />
            </span>
            <h2>Built on common ground.</h2>
            <p>
              Clear details and conversations with owners make it easier to find
              the right fit and work out a fair arrangement.
            </p>
          </article>
          <article>
            <span>
              <Leaf size={23} />
            </span>
            <h2>More from what we have.</h2>
            <p>
              Give idle equipment a new purpose. Help a neighbor get a job done,
              while making your investment work a little harder.
            </p>
          </article>
        </section>
      </Reveal>
      <Reveal>
        <section className="community-section page-width" id="community">
          <div className="community-photo">
            <img
              src={images.field}
              alt="Rolling green farmland in the afternoon sun"
              loading="lazy"
            />
            <div className="community-photo-caption">
              <Sprout size={25} />
              <span>
                Good things grow
                <br />
                when we grow together.
              </span>
            </div>
          </div>
          <div className="community-copy">
            <span className="eyebrow">YOUR EQUIPMENT. MORE POSSIBILITIES.</span>
            <h2>
              Let your equipment
              <br />
              earn its keep.
            </h2>
            <p>
              That tractor in your shed could be just what a neighbor needs.
              Give your equipment a second job, earn a little extra, and help
              your farming community grow.
            </p>
            <div className="community-benefits">
              <span>
                <Check size={17} />
                Your equipment. Your price. Your schedule.
              </span>
              <span>
                <Check size={17} />
                Reach farmers right in your community.
              </span>
              <span>
                <Check size={17} />
                Create your listing in just a few minutes.
              </span>
            </div>
            <button className="button primary" onClick={onList}>
              List your equipment
              <Plus size={17} />
            </button>
            <span className="listing-note">
              A small step for you. A big help for someone else.
            </span>
          </div>
        </section>
      </Reveal>
      <Reveal>
        <section className="community-story page-width">
          <span className="story-icon">
            <Users size={29} />
          </span>
          <span className="eyebrow">A MARKETPLACE WITH ROOTS</span>
          <h2>
            Big farms. Small plots.
            <br />
            There’s room for you here.
          </h2>
          <p>
            You might be preparing your first few acres, planning another
            harvest, or putting decades of experience to work. Whatever your
            season looks like, Farmigo is built around a simple idea: we can do
            more when we help each other grow.
          </p>
          <PageLink page="marketplace" className="text-link">
            Find your next workhorse
            <ArrowRight size={17} />
          </PageLink>
        </section>
      </Reveal>
      <Reveal>
        <section className="values-section page-width">
          <span className="values-leaf">
            <Sprout size={26} />
          </span>
          <div>
            <h3>Built on common ground.</h3>
            <p>
              For the early risers, the season planners, and the people who keep
              us growing.
            </p>
          </div>
          <span className="values-signature">Here’s to a good season.</span>
        </section>
      </Reveal>
    </>
  );
}
