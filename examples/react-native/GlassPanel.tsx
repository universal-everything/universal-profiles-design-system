/**
 * Glass tier recipe for React Native, reading every value from the generated theme.
 * The example assumes expo-blur and react-native-fast-shadow, as the shipped app does;
 * swap the imports for your app's blur and shadow primitives.
 */
import React from "react";
import { Platform, StyleSheet, View, type ViewProps, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { glass, lightTheme, type Theme } from "../../tokens/build/react-native/theme";

type Props = ViewProps & {
  theme?: Theme;
  /** Panel (32 radius top corners) or card (16 radius all corners). */
  variant?: "panel" | "card";
  /** Use the opaque tint when the platform reduce-transparency setting is on or blur is unavailable. */
  solid?: boolean;
};

export function GlassPanel({ theme = lightTheme, variant = "card", solid = false, style, children, ...rest }: Props) {
  const c = theme.colors;
  const panel = theme.components["glass-panel"];
  const radius = variant === "panel" ? panel.radius : panel["card-radius"];
  const radiusStyle: ViewStyle =
    variant === "panel"
      ? { borderTopLeftRadius: radius, borderTopRightRadius: radius }
      : { borderRadius: radius };
  const reflexWidth = variant === "panel" ? panel["reflex-width"] : panel["card-reflex-width"];
  const shadow: ViewStyle = Platform.OS === "ios" ? theme.shadows["glass-panel"] : {};

  return (
    <View style={[styles.container, radiusStyle, shadow, style]} {...rest}>
      {solid ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: glass.tintSolid(c) }]} />
      ) : (
        <BlurView
          style={StyleSheet.absoluteFill}
          intensity={variant === "panel" ? glass.blurIntensity : glass.cardBlurIntensity}
          tint={glass.blurTintLight}
          experimentalBlurMethod={glass.experimentalBlurMethod}
        />
      )}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: glass.tint(c) }]} />
      {/* Reflex edge: top and left highlight; counter edge: bottom and right. Inset shadows are iOS only, so both are drawn as borders. */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          radiusStyle,
          {
            borderTopWidth: reflexWidth,
            borderLeftWidth: reflexWidth,
            borderColor: c.border["glass-reflex"],
            borderBottomWidth: reflexWidth,
            borderRightWidth: reflexWidth,
            borderBottomColor: c.border["glass-counter"],
            borderRightColor: c.border["glass-counter"],
          },
        ]}
      />
      <View style={{ padding: panel.padding }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
});
