# Statics Study Lab

Buildless, responsive Exam 1 prototype. Open `dist/index.html` in a modern browser, or serve `dist` with any static HTTP server. Native MathML renders fractions and other mathematics without a runtime dependency. Google Fonts are optional; system fonts are the fallback.

Includes a 2D force playground, component solutions, original guided practice, an equation reference with context-specific clickable symbols, and a TI-84-style scientific calculator. The position/unit-vector lesson accepts 3D points, shows axis projections and a 3D projection, allows point dragging in axis views, and walks through displacement, distance, unit direction, force components, and coordinate direction angles. Practice progresses through three calculation stages. Coincident points explicitly have no unit direction. Projected screen angles and lengths are not physical measurements.

This is not TI firmware. Resultant-practice completion stays in browser-local storage; it does not sync between devices. Textbook questions/answers and moment lessons are not yet included.

Force projections accept 3D force and axis components, normalize the axis, and show the signed scalar, parallel vector, perpendicular remainder, and included angle. Reversing the positive axis preserves the vector projection. Practice includes positive, negative, perpendicular, and 3D examples. Zero-axis directions are rejected; zero-force angles are undefined.

Run `node check.cjs`, `node check-ui.cjs`, `node check-position.cjs`, and `node --check dist/position.js` for numerical, rendering, and syntax checks. Rendering checks use a simulated DOM and do not verify real browser layout or touch behavior.
