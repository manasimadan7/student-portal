/* Figma 474:4030 — exported as inline SVG so the flower and the star can be animated separately.
   Flower ("Exclude") pivots on (551.414, 482.487); star ("Union") on (547.248, 483.571). */
export default function SplashMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 -68.9 1102.85 1102.85"
      overflow="visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g filter="url(#sp-filter)">
        <rect x="68.9273" width="965" height="965" rx="482.5" fill="url(#sp-disc)" fillOpacity="0.9" shapeRendering="crispEdges" />
        <rect x="76.2377" y="7.31047" width="950.379" height="950.379" rx="475.19" stroke="url(#sp-ring)" strokeWidth="14.6209" shapeRendering="crispEdges" />

        {/* Flower — 4 lobes with the diamond cut out of the middle */}
        <g className="splash__flower">
          <use href="#sp-flower" fill="url(#sp-flower-fill)" />
          <mask id="sp-flower-mask" fill="white">
            <use href="#sp-flower" />
          </mask>
          <path
            d="M551.414 87.7141C454.513 87.7141 375.96 166.268 375.96 263.169V307.032H332.096C235.195 307.032 156.641 385.586 156.641 482.487C156.641 579.388 235.195 657.941 332.096 657.941H375.96V701.805C375.96 798.706 454.513 877.26 551.414 877.26C648.315 877.26 726.869 798.706 726.869 701.805V657.941H770.732C867.633 657.941 946.187 579.388 946.187 482.487C946.187 385.586 867.633 307.032 770.732 307.032H726.869V263.169C726.869 166.268 648.315 87.7141 551.414 87.7141ZM551.414 690.839C530.454 607.443 435.936 504.762 364.994 487.97C435.936 471.178 530.454 368.497 551.414 285.1C572.374 368.497 666.892 471.178 737.835 487.97C666.892 504.762 572.374 607.443 551.414 690.839Z"
            strokeWidth="13.7855"
            stroke="url(#sp-flower-stroke)"
            strokeOpacity="0.3"
            mask="url(#sp-flower-mask)"
          />
        </g>

        {/* Star — six hexagons around the centre */}
        <path
          className="splash__star"
          d="M640.458 258.771V314.969L687.063 286.868L795.809 333.702L780.274 455.47L733.667 483.571L780.274 511.672L795.809 633.439L687.063 680.273L640.458 652.173V708.373L547.248 783.307L454.038 708.373V652.173L407.433 680.273L298.687 633.439L314.223 511.672L360.829 483.571L314.222 455.47L298.687 333.702L407.433 286.868L454.038 314.969V258.771L547.248 183.837L640.458 258.771ZM461.805 262.763L547.248 194.074L632.691 262.763V319.652L562.783 361.802L548.703 472.166L547.248 473.335L545.793 472.166L531.713 361.802L461.805 319.652V262.763ZM368.597 488.254L321.417 516.701L307.177 628.321L406.86 671.252L454.038 642.806V558.505L538.516 490.591L538.759 488.69L537.059 487.958L438.503 530.403L368.597 488.254ZM526.872 483.571L439.076 521.382L376.364 483.571L439.076 445.759L526.872 483.571ZM537.059 479.183L438.503 436.738L368.597 478.887L321.417 450.441L307.177 338.821L406.86 295.89L454.038 324.335V408.639L538.517 476.553L538.759 478.451L537.059 479.183ZM537.061 501.998L461.805 562.498V638.123L524.518 600.31L537.061 501.998ZM461.805 647.489L531.713 605.339L545.793 494.979L547.248 493.809L548.703 494.979L562.783 605.339L632.691 647.489V704.381L547.248 773.07L461.805 704.381V647.489ZM569.978 366.831L632.691 329.019V404.646L557.435 465.146L569.978 366.831ZM640.458 408.639L555.979 476.553L555.737 478.451L557.437 479.183L655.993 436.738L725.899 478.887L773.079 450.441L787.32 338.821L687.636 295.89L640.458 324.335V408.639ZM655.993 530.403L557.437 487.958L555.737 488.69L555.98 490.591L640.458 558.505V642.806L687.636 671.252L787.32 628.321L773.079 516.701L725.899 488.254L655.993 530.403ZM655.42 521.382L718.132 483.571L655.42 445.759L567.624 483.571L655.42 521.382ZM557.435 501.998L632.691 562.498V638.123L569.978 600.31L557.435 501.998ZM524.518 366.831L537.061 465.146L461.805 404.646V329.019L524.518 366.831Z"
          fillRule="evenodd"
          clipRule="evenodd"
          fill="url(#sp-star-fill)"
        />
      </g>

      <defs>
        <filter id="sp-filter" x="0" y="0" width="1102.85" height="1125.83" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feMorphology radius="45.9515" operator="erode" in="SourceAlpha" result="effect1_dropShadow" />
          <feOffset dy="91.903" />
          <feGaussianBlur stdDeviation="57.4394" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.694118 0 0 0 0 0.560784 0 0 0 0 0.843137 0 0 0 0.3 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="91.903" />
          <feGaussianBlur stdDeviation="45.9515" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="shape" result="effect2_innerShadow" />
          <feBlend mode="normal" in="effect2_innerShadow" in2="effect1_dropShadow" result="effect2_innerShadow" />
        </filter>
        <linearGradient id="sp-disc" x1="551.427" y1="0" x2="551.427" y2="965" gradientUnits="userSpaceOnUse">
          <stop stopColor="#43AEC4" />
          <stop offset="1" stopColor="#F4EBFB" />
        </linearGradient>
        <linearGradient id="sp-ring" x1="551.427" y1="0" x2="827.142" y2="896.071" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3A6F91" />
          <stop offset="1" stopColor="#F4EBFB" />
        </linearGradient>
        <radialGradient id="sp-flower-fill" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(551.414 482.487) rotate(89.9987) scale(593.859)">
          <stop offset="0.254808" stopColor="#00798E" />
          <stop offset="0.5" stopColor="#43AEC4" />
          <stop offset="0.865385" stopColor="white" />
        </radialGradient>
        <linearGradient id="sp-flower-stroke" x1="495.754" y1="417.548" x2="1340.13" y2="482.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F4EBFB" />
          <stop offset="1" stopColor="#5084A4" />
        </linearGradient>
        <radialGradient id="sp-star-fill" cx="0" cy="0" r="1" gradientTransform="matrix(229.142 361.378 -299.679 207.239 547.248 483.572)" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <path
          id="sp-flower"
          d="M375.96 263.169C375.96 166.268 454.513 87.7141 551.414 87.7141C648.315 87.7141 726.869 166.268 726.869 263.169V307.032H770.732C867.633 307.032 946.187 385.586 946.187 482.487C946.187 579.388 867.633 657.941 770.732 657.941H726.869V701.805C726.869 798.706 648.315 877.26 551.414 877.26C454.513 877.26 375.96 798.706 375.96 701.805V657.941H332.096C235.195 657.941 156.641 579.388 156.641 482.487C156.641 385.586 235.195 307.032 332.096 307.032H375.96V263.169ZM364.994 487.97C435.936 504.762 530.454 607.443 551.414 690.839C572.374 607.443 666.892 504.762 737.835 487.97C666.892 471.178 572.374 368.497 551.414 285.1C530.454 368.497 435.936 471.178 364.994 487.97Z"
          fillRule="evenodd"
          clipRule="evenodd"
        />
      </defs>
    </svg>
  )
}
