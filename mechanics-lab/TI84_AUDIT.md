# TI-84 calculation audit

The October 17 update contains 76 original problem families with three examples each: 228 walkthroughs and 1,137 numerical answer fields.

## Three verification methods

1. Original answer data is captured before enrichment, then compared with input-based TI calculator recipes. These recipes reconstruct coordinates, vector operations, moment arms, load integrals, and calculus coefficients rather than reading the answer values. Tiny differences from previously truncated constants are checked with a relative tolerance, and the unrounded reconstructed values are used thereafter.
2. Every recipe expression is evaluated with StudyMath and independently with a separate JavaScript arithmetic context, including the specified angle mode and stored-variable substitutions.
3. Every scenario has an additional mathematical check: vector reconstruction and norms, perpendicularity, scalar triple products and reference shifts, independent summation of couple moments, force/moment equivalence, Simpson quadrature, antiderivative differentiation, or rectangle-sum accumulation. Conceptual choices remain explanatory teaching content rather than numerical audit fields.

The test also solves every example through the simulated roadmap UI and checks live workspace entries over multiple arbitrary inputs, zero-direction rejection, current-input refresh, and physical-TI instruction rendering.

## Reproduce

From the mechanics-lab directory run `node check-ti84.cjs`. Its successful output reports 228 examples and 1,137 numerical answers. The original workspace/assessment regression scripts remain applicable.

## Physical calculator guidance

- Statics trigonometry uses DEGREE; standard calculus trig differentiation/integration uses RADIAN.
- Instructions distinguish the [(-)] negation key from subtraction, compensate for inverse-tangent quadrants, and use STO→ to retain intermediate precision.
- Standard TI-84 Plus fnInt evaluates definite integrals numerically. It does not provide symbolic antiderivatives; symbolic integration remains paper work, checked numerically where appropriate.
- The app’s embedded TI-style calculator is a subset. It does not implement STO, fnInt, or nDeriv. Recipes explicitly target a physical TI-84 Plus.

TI references: [fnInt instructions](https://education.ti.com/en/customer-support/knowledge-base/ti-83-84-plus-family/product-usage/34694) and [degree-mode/trigonometry instructions](https://education.ti.com/en/customer-support/knowledge-base/ti-83-84-plus-family/product-usage/34771).

No TI hardware or real-browser visual/touch verification was performed. Numerical checks use finite precision and tolerances; they are evidence of correctness, not a guarantee against every possible content or device error.
