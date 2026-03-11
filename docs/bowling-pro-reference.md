# Bowling Pro Tour Reference

## Source Pack
- Reference repo: `https://github.com/CompleteBlenderCreator/03-Bowling-Assets-Original`
- Source: Complete Blender Creator / EmbraceIT Ltd
- License: MIT

## Asset Inventory Extracted From The Pack
- `Bowling Alley.blend`: base alley scene used as the main environment reference.
- `Bowling Alley Fun With Physics.blend`: alley scene with pin and ball physics experiments.
- `Bowling Ball.blend`: dark glossy bowling ball reference.
- `BowlingPin.blend`: primary pin model with classic silhouette.
- `BowlingPinCollider.blend`: simplified collider mesh used as inspiration for lightweight pinfall logic.
- `Section 3 Bowling Pins Assets/PinReference.png` (`2000x6375`): vertical silhouette guide for the pin profile.
- `Unity Project (optional)/Assets/Pin.unity`: simple integration scene confirming pin + collider + materials.
- `Unity Project (optional)/Assets/Materials/Pin.mat`: warm ivory body material.
- `Unity Project (optional)/Assets/Materials/Stripe.mat`: red neck stripe material.
- `Unity Project (optional)/Assets/Materials/unnamed.mat`: neutral helper material used as gray reference.

## Environment Cues Mapped Into The Browser Game
- Pair of adjacent lanes with A/B alternation.
- Varnished wood boards, dark gutters, kickbacks, foul line, and rear pin deck.
- Broadcast-style overhead monitors and a central ball return.
- White pins with red stripe and a dark glossy ball as the core visual read.
- Simplified physics presentation: readable pinfall first, full rigid-body simulation second.

## Browser Implementation
- The `.blend` files are not imported directly. The game reinterprets the alley in canvas with perspective geometry.
- Pin drawing is based on the pack silhouette instead of a flat ellipse.
- Pinfall uses deterministic scoring plus a lightweight collider-inspired carry model:
  - front-support relationships between rows,
  - neighboring-pin scatter,
  - aim / power / spin influence,
  - foul as a scored delivery worth zero.
- The UI embeds the reference itself:
  - in-game `Assets y entorno` panel,
  - in-game `Reglamento` panel,
  - official score sheet with `X`, `/`, `F`, split mark, and cumulative totals.

## Complete Rule Input Used For The Rebuild

### Frames and scoring
1. A bowling game has ten frames; the first nine allow up to two balls unless there is a strike, and the tenth grants a third ball with strike or spare.
2. Each frame records first and second delivery marks immediately.
3. A strike scores ten plus the next two deliveries.
4. A double means two consecutive strikes; the first becomes twenty plus the following ball.
5. A triple means three consecutive strikes; twelve straight strikes make 300.
6. A spare scores ten plus the next delivery.
7. A frame is open when the player fails to clear ten pins in two balls.
8. A split happens when the head pin is down and separated or unsupported pins remain.

### Lanes, pins, and legality
9. Play alternates across a pair of adjacent lanes, one frame per lane in sequence.
10. Legal pinfall includes ball-driven and legally rebounded dead wood.
11. Illegal pinfall counts as a delivery but not as scored pinfall.
12. Mis-set pins count if discovered only after the delivery, but should be corrected before the shot when detected in time.
13. Rebounded pins that remain standing stay standing.
14. Pins cannot be conceded; only legally downed pins count.
15. Damaged pins should be replaced with equivalent ones.
16. Dead-ball conditions require the shot to be replayed.
17. Delivering on the wrong lane triggers a dead ball or continuation according to the competitive context.

### Fouls, protests, and competition clauses
18. A foul occurs when the player crosses the foul line and contacts lane/equipment during or after delivery.
19. Deliberate foul for benefit scores zero and does not grant a replay.
20. A foul still counts as a delivered ball.
21. Apparent fouls can be validated by captains, scorer, or tournament official.
22. Foul appeals only proceed for detector malfunction or clear evidence.
23. Provisional balls/frames are used for unresolved disputes.
24. Altering the bowling ball surface during certified competition is prohibited.
25. The approach cannot be altered with substances or debris.
26. Scoring errors must be corrected by the official within the regulation time window.

## Runtime Coverage
- Simulated directly: 1, 2, 3, 4, 5, 6, 7, 8, 9, 20.
- Simulated partially: 10, 11, 13, 14, 18.
- Documented in the in-game rulebook for officiating context: 12, 15, 16, 17, 19, 21, 22, 23, 24, 25, 26.
