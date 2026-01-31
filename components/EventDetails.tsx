// Force this route to render at runtime (not during build)
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Image from "next/image";

import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import { IEvent } from "@/database";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * Reusable UI helpers
 */
const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string }) => (
  <div className="flex-row-gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map(tag => (
      <div className="pill" key={tag}>
        {tag}
      </div>
    ))}
  </div>
);

/**
 * Page component
 */
const EventDetails = async ({ params }: { params: { slug: string } }) => {
  const { slug } = params;

  let event;

  try {
    const request = await fetch(`${BASE_URL}/api/events/${slug}`, {
      cache: "no-store" // ensure runtime fetch
    });

    if (!request.ok) {
      if (request.status === 404) {
        return notFound();
      }
      throw new Error(`Failed to fetch event`);
    }

    const response = await request.json();
    event = response.event;

    if (!event) {
      return notFound();
    }
  } catch (error) {
    console.error("Error fetching event:", error);
    return notFound();
  }

  const { description, image, overview, date, time, location, mode, agenda, audience, tags, organizer } = event;

  if (!description) return notFound();

  // TODO: Replace with real booking count
  const bookings = 10;

  const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);

  return (
    <section id="event">
      {/* Header */}
      <div className="header">
        <h1>Event Description</h1>
        <p>{description}</p>
      </div>

      <div className="details">
        {/* Left side – Event content */}
        <div className="content">
          <Image src={image} alt="Event Banner" width={800} height={800} className="banner" />

          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex-col-gap-2">
            <h2>Event Details</h2>

            <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
            <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
            <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
            <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
            <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
          </section>

          <EventAgenda agendaItems={agenda} />

          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={tags} />
        </div>

        {/* Right side – Booking */}
        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>

            {bookings > 0 ? <p className="text-sm">Join {bookings} people who have already booked their spot!</p> : <p className="text-sm">Be the first to book your spot!</p>}

            <BookEvent eventId={event._id} slug={event.slug} />
          </div>
        </aside>
      </div>

      {/* Similar events */}
      <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similar Events</h2>

        <div className="events">{similarEvents.length > 0 && similarEvents.map(similarEvent => <EventCard key={similarEvent._id.toString()} {...similarEvent} />)}</div>
      </div>
    </section>
  );
};

export default EventDetails;
