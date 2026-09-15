/**
 * The UP Box hero for the mobile home panel: cover with the address gradient, floating avatar
 * with ring and identicon badge, name with suffix, counters. Every number comes from the
 * generated theme; every address-derived value comes from the address-signature package.
 */
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SvgXml } from "react-native-svg";
import { lightTheme, maxFontSizeMultiplier, type Theme } from "../../tokens/build/react-native/theme";
import { displayNameParts, gradientReactNative, identiconSvg, sliceAddress } from "../../packages/address-signature/src/index.mjs";
import { GlassPanel } from "./GlassPanel";

type Props = {
  address: string;
  name?: string;
  avatarUrl?: string;
  coverUrl?: string;
  following: number;
  followers: number;
  theme?: Theme;
};

export function ProfileCard({ address, name, avatarUrl, coverUrl, following, followers, theme = lightTheme }: Props) {
  const c = theme.colors;
  const card = theme.components["profile-card"];
  const identicon = theme.identicon;
  const avatarSize = card["avatar-size-mobile"];
  const ring = card["avatar-ring-mobile"];
  const badge = identicon.xl.badge;
  const parts = displayNameParts(name, address);
  const gradient = gradientReactNative(address, { theme: theme.name });

  return (
    <View style={styles.root}>
      {coverUrl ? (
        <Image source={{ uri: coverUrl }} style={styles.cover} resizeMode="cover" accessible={false} />
      ) : (
        <LinearGradient
          colors={gradient.colors}
          start={gradient.start}
          end={gradient.end}
          style={[styles.cover, { backgroundColor: c.surface["cover-fallback"] }]}
        />
      )}

      <GlassPanel theme={theme} variant="panel" style={styles.panel}>
        <View style={[styles.avatar, { width: avatarSize + ring * 2, height: avatarSize + ring * 2, borderRadius: (avatarSize + ring * 2) / 2, top: card["avatar-offset-mobile"], backgroundColor: c.avatar.ring, ...theme.shadows.avatar }]}
          accessible
          accessibilityRole="image"
          accessibilityLabel={avatarUrl ? `Profile image of ${parts.text}` : "Default profile image"}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, margin: ring }} />
          ) : (
            <View style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, margin: ring, backgroundColor: c.surface["avatar-fallback"] }} />
          )}
          <View
            style={{
              position: "absolute",
              right: identicon["badge-offset"],
              bottom: identicon["badge-offset"],
              width: badge + identicon.xl.ring * 2,
              height: badge + identicon.xl.ring * 2,
              borderRadius: (badge + identicon.xl.ring * 2) / 2,
              backgroundColor: c.avatar["badge-ring"],
              padding: identicon.xl.ring,
              overflow: "hidden",
            }}
          >
            <SvgXml xml={identiconSvg(address, { scale: badge / 8 })} width={badge} height={badge} />
          </View>
        </View>

        <View style={{ marginTop: avatarSize / 2 + ring + card["content-gap"] }}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            maxFontSizeMultiplier={maxFontSizeMultiplier.mono}
            style={[theme.typography["mono.xl"], { color: card["username-color"] }]}
            accessibilityLabel={parts.text}
          >
            {parts.prefix}
            {parts.name}
            <Text style={{ color: card["suffix-color"] }}>{parts.suffix}</Text>
          </Text>
          <Text maxFontSizeMultiplier={maxFontSizeMultiplier.default} style={[theme.typography["body.m"], { color: card["counters-color"], marginTop: card["content-gap"] / 2 }]}>
            {following} Following · {followers} Followers
          </Text>
          <Text maxFontSizeMultiplier={maxFontSizeMultiplier.mono} style={[theme.typography["mono.s"], { color: c.text.muted, marginTop: card["content-gap"] }]}>
            {sliceAddress(address, { leading: 10, trailing: 8 })}
          </Text>
        </View>
      </GlassPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  cover: { ...StyleSheet.absoluteFillObject },
  panel: { position: "absolute", left: 0, right: 0, bottom: 0 },
  avatar: { position: "absolute", alignSelf: "center", alignItems: "center", justifyContent: "center" },
});
