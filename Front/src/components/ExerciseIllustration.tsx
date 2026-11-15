import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SvgUri } from 'react-native-svg';

interface Props {
  slug?: string | null;
  fotogramasSvg?: string[];
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export const ExerciseIllustration: React.FC<Props> = ({
  fotogramasSvg,
  width = 140,
  height = 120,
  color = '#FFFFFF',
  backgroundColor = '#000000',
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = fotogramasSvg?.[0];

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <View style={[styles.container, { width, height, backgroundColor }]}>
      {imageUrl && !imageFailed ? (
        <SvgUri
          uri={imageUrl}
          width={width}
          height={height}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <Ionicons name="barbell-outline" size={32} color={color} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default ExerciseIllustration;
