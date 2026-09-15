/**
 * Five-slot bottom bar with the raised centre action, on the glass bar shell.
 * Inactive items use colour (not opacity) so labels keep 4.5:1 over any cover.
 */
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { glass, lightTheme, maxFontSizeMultiplier, type Theme } from "../../tokens/build/react-native/theme";

export type TabItem = { key: string; label: string; icon: (color: string, size: number) => React.ReactNode; action?: boolean };

type Props = { items: TabItem[]; activeKey: string; onPress: (key: string) => void; theme?: Theme; bottomInset?: number };

export function TabBar({ items, activeKey, onPress, theme = lightTheme, bottomInset = 0 }: Props) {
  const c = theme.colors;
  const bar = theme.components["tab-bar"];
  const shell = theme.components["glass-bar"];
  const insetMultiplier = Platform.OS === "android" ? 1 : 0.5;

  return (
    <View style={[styles.shell, { paddingBottom: bottomInset * insetMultiplier, paddingHorizontal: Platform.OS === "ios" ? shell["padding-x-ios"] : 0 }]}>
      <BlurView style={StyleSheet.absoluteFill} intensity={glass.tabBarBlurIntensity} tint={glass.blurTintLight} experimentalBlurMethod={glass.experimentalBlurMethod} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: glass.barTint(c) }]} />
      <View pointerEvents="none" style={[styles.edge, { backgroundColor: shell["edge-dark"] }]} />
      <View pointerEvents="none" style={[styles.edge, { top: 1, backgroundColor: shell["edge-bright"] }]} />
      <View style={[styles.row, { height: bar["item-height"] }]} accessibilityRole="tablist">
        {items.map((item) => {
          const active = item.key === activeKey;
          const color = active ? bar["label-color"] : bar["inactive-color"];
          if (item.action) {
            return (
              <Pressable
                key={item.key}
                onPress={() => onPress(item.key)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                style={({ pressed }) => [styles.item, { transform: [{ scale: pressed ? theme.motion.scale.press : 1 }] }]}
              >
                <View style={{ width: bar["action-size"], height: bar["action-size"], borderRadius: bar["action-size"] / 2, backgroundColor: bar["action-fill"], alignItems: "center", justifyContent: "center", top: -theme.spacing[5] }}>
                  {item.icon(bar["action-icon"], bar["icon-size"])}
                </View>
              </Pressable>
            );
          }
          return (
            <Pressable
              key={item.key}
              onPress={() => onPress(item.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={item.label}
              style={styles.item}
            >
              {item.icon(color, bar["icon-size"])}
              <Text maxFontSizeMultiplier={maxFontSizeMultiplier.nav} style={[theme.typography["label.nav"], { color, marginTop: theme.spacing[1] }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { overflow: "hidden", elevation: 0 },
  edge: { position: "absolute", left: 0, right: 0, top: 0, height: StyleSheet.hairlineWidth },
  row: { flexDirection: "row", alignItems: "center" },
  item: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 44 },
});
