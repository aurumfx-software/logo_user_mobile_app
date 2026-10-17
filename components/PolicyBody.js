import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Spacing } from '../constants/theme';

function PolicyBlock({ block, index }) {
  const lines = block.split('\n').filter((l) => l.trim());
  if (!lines.length) return null;

  const isSection = /^\d+\.\s/.test(lines[0]);
  if (!isSection) {
    return (
      <Text key={index} style={styles.paragraph}>
        {block.trim()}
      </Text>
    );
  }

  const [title, ...rest] = lines;
  return (
    <View key={index} style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {rest.map((line, i) => {
        const bullet = line.trim().startsWith('•');
        return (
          <Text key={i} style={bullet ? styles.bullet : styles.paragraph}>
            {line.trim()}
          </Text>
        );
      })}
    </View>
  );
}

export default function PolicyBody({ content }) {
  if (!content) return null;
  const blocks = content.split(/\n\n+/);
  return (
    <View style={styles.wrap}>
      {blocks.map((block, index) => (
        <PolicyBlock key={index} block={block} index={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.md,
  },
  section: {
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  paragraph: {
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  bullet: {
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: Colors.textSecondary,
    paddingLeft: Spacing.xs,
  },
});
