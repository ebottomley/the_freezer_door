import Header from '../Header/Header';

function FreezerBarBasics() {
  return (
    <div className="basics-page">
      <Header showBack={true} />
      <main className="container">
        <article className="basics-content">
          <h1 className="basics-title">Freezer Bar Basics</h1>

          <section id="intro" className="basics-section">
            <p className="intro-text">
              A freezer bar is a collection of pre-batched cocktails stored in your freezer, ready to pour at a moment's notice. No ice, no stirring, no measuring — just grab a bottle and pour. It's perfect for entertaining, keeping a nightcap on hand, or simply enjoying a perfectly chilled drink without any prep work.
            </p>
          </section>

          <section id="best-cocktails" className="basics-section">
            <h2>What Makes a Drink Good for the Freezer</h2>
            <p>
              The best freezer cocktails are spirit-forward and made entirely from shelf-stable ingredients. They have enough alcohol to stay liquid at freezer temperatures, and their flavors hold up over time without degrading.
            </p>
            <p>
              <strong>Rule of thumb:</strong> If it's boozy and shelf-stable, throw it in the freezer.
            </p>

            <div className="tip-box">
              <h4>Best Choices</h4>
              <p><strong>Spirit-forward, shelf-stable drinks:</strong> Martini, Manhattan, Negroni, Old Fashioned</p>
            </div>
            <div className="warning-box">
              <h4>Worst Choices</h4>
              <p><strong>Fresh citrus drinks:</strong> Margarita, Daiquiri, Whiskey Sour</p>
              <ul>
                <li>Fresh citrus juice degrades within hours and turns bitter over time</li>
                <li>Citrus drinks also tend to have lower ABV, making them prone to freezing</li>
              </ul>
            </div>
          </section>

          <section id="abv" className="basics-section">
            <h2>What is ABV and Why It Matters</h2>
            <p>
              <strong>ABV</strong> stands for <strong>Alcohol By Volume</strong> — the percentage of your drink that is pure alcohol. For freezer cocktails, ABV is critical because it determines whether your cocktail freezes solid, becomes slushy, or stays perfectly pourable.
            </p>

            <h3>ABV and Freezing Point Guide</h3>
            <p className="tip-box">
              A typical home freezer runs at 0°F (-18°C). Use this table to understand how your cocktail will behave.
            </p>
            <table className="abv-table">
              <thead>
                <tr>
                  <th>ABV</th>
                  <th>Freezing Point</th>
                  <th>Result in typical freezer after 4 hours</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>20%</td>
                  <td>~14°F (-10°C)</td>
                  <td>Freezes solid</td>
                </tr>
                <tr>
                  <td>25%</td>
                  <td>~5°F (-15°C)</td>
                  <td>Very slushy</td>
                </tr>
                <tr>
                  <td>30%</td>
                  <td>~-4°F (-20°C)</td>
                  <td>Stays liquid, very viscous</td>
                </tr>
                <tr>
                  <td>35%</td>
                  <td>~-11°F (-24°C)</td>
                  <td>Pourable, silky texture</td>
                </tr>
                <tr>
                  <td>40%</td>
                  <td>~-18°F (-28°C)</td>
                  <td>Pourable, less viscous</td>
                </tr>
              </tbody>
            </table>

            <p className="tip-box">
              <strong>Freezing time:</strong> Most cocktails reach optimal temperature in 2-4 hours; overnight ensures they're fully chilled.
            </p>
          </section>

          <section id="dilution" className="basics-section">
            <h2>The Importance of Dilution</h2>
            <p>
              When you stir a cocktail over ice, water naturally enters the drink — typically <strong>15-25%</strong> of the total volume. This dilution is essential: it softens alcohol's harshness and integrates flavors.
            </p>
            <p>
              Freezer cocktails skip the stirring step, so you must <strong>pre-dilute with water</strong> to achieve the same balance.
            </p>
            <ul>
              <li><strong>Less dilution</strong> = higher ABV = stays more liquid in freezer</li>
              <li><strong>More dilution</strong> = lower ABV = may become slushy</li>
            </ul>
            <p className="tip-box">
              Use filtered or distilled water for subtle cocktails like the Martini. Start with less dilution than a stirred drink — you can always add more.
            </p>
          </section>

          <section id="bitters" className="basics-section">
            <h2>Adjusting Bitters for Larger Batches</h2>
            <p>
              Bitters intensify mysteriously in large batches. For best results:
            </p>
            <ul>
              <li><strong>Cut bitters in half</strong> for batches over 5 cocktails</li>
              <li>Taste and adjust as needed — you can always add more</li>
            </ul>
          </section>

          <section id="scaling" className="basics-section">
            <h2>Scaling Recipes & Storage</h2>
            <ul>
              <li>Multiply ingredients by 6 to fill a standard <strong>750ml bottle</strong></li>
              <li>Leave a couple ounces of headspace for expansion</li>
              <li>Use proper bottles: phenolic screw caps, swing tops, or synthetic corks</li>
              <li className="warning-box">Avoid metal screw caps (can corrode or stick at freezer temps)</li>
            </ul>
            <p className="tip-box">
              Cocktails can be stored for weeks to months; some say up to a year!
            </p>
          </section>

          <section id="sources" className="basics-section">
            <h2>Sources</h2>
            <ul className="sources-list">
              <li>
                <strong>Death & Co Market</strong> — "The Freezer Bar: Basics and Beyond"
              </li>
              <li>
                <strong>Punch Drink</strong> — "How to Batch and Freeze Martinis, Negronis and Other Cocktails"
              </li>
              <li>
                <strong>Imbibe Magazine</strong> — "The Do's and Don'ts of Freezer Door Cocktails"
              </li>
              <li>
                <strong>Jeffrey Morgenthaler</strong> — "Save Your Leftover Batched Cocktails"
              </li>
            </ul>
          </section>
        </article>
      </main>
    </div>
  );
}

export default FreezerBarBasics;
