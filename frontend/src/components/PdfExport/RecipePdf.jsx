import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { formatSimplifiedAmount } from '../../utils/simplifyMeasurements';
import { getSpiritLabel } from '../../constants/spiritLabels';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF'
  },
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #C41E3A',
    paddingBottom: 15
  },
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#C41E3A',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 12,
    color: '#777777'
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#777777',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    borderBottom: '1px solid #E0E0E0',
    paddingBottom: 5
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottom: '1px solid #F0F0F0'
  },
  ingredientName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1A1A1A'
  },
  ingredientBrand: {
    fontSize: 9,
    color: '#777777',
    marginTop: 2
  },
  ingredientAmount: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#C41E3A',
    textAlign: 'right'
  },
  waterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    backgroundColor: 'rgba(69, 183, 170, 0.1)',
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: 5
  },
  waterText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#45B7AA'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15
  },
  stat: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FAFAFA',
    borderRadius: 4,
    minWidth: 80
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#C41E3A'
  },
  statLabel: {
    fontSize: 8,
    color: '#777777',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 3
  },
  garnish: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#FAFAFA',
    borderRadius: 4,
    textAlign: 'center'
  },
  garnishText: {
    fontSize: 10,
    color: '#777777'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#AAAAAA'
  }
});

function RecipePdfDocument({ results, unit, simplified, numDrinks }) {
  const showOz = unit === 'oz';

  const formatAmount = (ml, oz) => {
    if (simplified) {
      return formatSimplifiedAmount(ml, oz, showOz);
    }
    if (showOz) {
      return `${oz} oz`;
    }
    return `${ml} ml`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{results.cocktail_name}</Text>
          <Text style={styles.subtitle}>
            {results.variation_name} - Freezer Batch Recipe{simplified ? ' (Simplified)' : ''}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>

          {Object.entries(results.ingredients).map(([ingredient, ml]) => (
            <View key={ingredient} style={styles.ingredientRow}>
              <View>
                <Text style={styles.ingredientName}>
                  {getSpiritLabel(ingredient)}
                </Text>
                {results.spirit_brands[ingredient] && (
                  <Text style={styles.ingredientBrand}>
                    {results.spirit_brands[ingredient]}
                  </Text>
                )}
              </View>
              <Text style={styles.ingredientAmount}>
                {formatAmount(ml, results.ingredients_oz[ingredient])}
              </Text>
            </View>
          ))}

          <View style={styles.waterRow}>
            <Text style={styles.waterText}>Water (for dilution)</Text>
            <Text style={styles.waterText}>
              {formatAmount(results.water_ml, results.water_oz)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{results.initial_abv}%</Text>
              <Text style={styles.statLabel}>Initial ABV</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{results.final_abv}%</Text>
              <Text style={styles.statLabel}>Final ABV</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {showOz ? `${results.total_volume_oz} oz` : `${results.total_volume_ml} ml`}
              </Text>
              <Text style={styles.statLabel}>Total Volume</Text>
            </View>
            {numDrinks && (
              <View style={styles.stat}>
                <Text style={styles.statValue}>{numDrinks}</Text>
                <Text style={styles.statLabel}>Drinks</Text>
              </View>
            )}
          </View>
        </View>

        {results.garnish && (
          <View style={styles.garnish}>
            <Text style={styles.garnishText}>Garnish: {results.garnish}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          Generated by The Freezer Door - thefreezerDoor.com
        </Text>
      </Page>
    </Document>
  );
}

export async function generateRecipePdf(results, unit, simplified = false, numDrinks = null) {
  const blob = await pdf(<RecipePdfDocument results={results} unit={unit} simplified={simplified} numDrinks={numDrinks} />).toBlob();

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${results.cocktail_name.replace(/[^a-z0-9]/gi, '_')}_recipe.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default RecipePdfDocument;
