# Examples

Self-contained examples that use the generated tokens instead of literal values. The validator rejects hard-coded colours here.

| Example | What it shows |
|---|---|
| [web/profile-card.html](web/profile-card.html) and [web/profile-card.css](web/profile-card.css) | The UP Box in HTML and CSS with the `--up-*` properties, light and dark, the address gradient, identicon badge, `@name#XXXX`, the focus ring rule, a token row and a network tag. Open the file in a browser; it links the generated stylesheet relatively. |
| [react-native/ProfileCard.tsx](react-native/ProfileCard.tsx) | The mobile hero card on the glass panel with the generated theme and the address-signature helpers |
| [react-native/GlassPanel.tsx](react-native/GlassPanel.tsx) | The glass tier recipe with platform pairs and the solid fallback |
| [react-native/TabBar.tsx](react-native/TabBar.tsx) | The five-slot bar with the raised centre action, inactive colour instead of opacity |
| [marketing/README.md](marketing/README.md) | How to produce link previews, social posts and store frames from the generators and the generated images |
| [agent-playbooks/README.md](agent-playbooks/README.md) | Prompts and expected outputs for Claude Code and compatible agents |

The React Native files import `react-native` types and the generated theme; they type-check inside an app that has React Native installed and are not compiled here.
