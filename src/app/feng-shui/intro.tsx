import Container from "../components/container";

const Intro = () => {
  return (
    <Container>
      <h1 className="text-4xl py-4">
        {" "}
        Pheydrus Tools - Flying Star Feng Shui 📍{" "}
      </h1>
      <div className="print:hidden">
        <p className="text-lg py-4 "> What is this page?</p>
        <p>
          This page will compare your home&apos;s flying star chart with that of
          the current period and current year.{" "}
        </p>
        <p className="text-lg py-4"> What do you need to use this page?</p>
        <ol className="pl-8 list-decimal">
          <li>
            The date you moved into your home & flying star chart for the same
            year
          </li>
          <li> A floor plan of your home and which direction is North </li>
        </ol>
      </div>
      <p className="text-lg py-4"> How to get your</p>
      <ol className="pl-8 list-decimal">
        <li>Fill in the flying star numbers for your home below</li>
        <li>
          Your chart elements + elements for the current period and year will be
          populated.
        </li>
        <li> Auspicious stars will be marked with a ⭐️ </li>
        <li> Inspicious stars will be marked with a ❗️ </li>
      </ol>
    </Container>
  );
};
export default Intro;
