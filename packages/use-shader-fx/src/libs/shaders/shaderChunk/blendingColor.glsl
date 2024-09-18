// float screenAspect = resolution.x / resolution.y;
// float blendingSrcAspect = fxBlendingSrcResolution.x / fxBlendingSrcResolution.y;
// vec2 aspectRatio = vec2(
// 	min(screenAspect / blendingSrcAspect, 1.0),
// 	min(blendingSrcAspect / screenAspect, 1.0)
// );
// vec2 coverUV = vUv * aspectRatio + (1.0 - aspectRatio) * .5;
vec4 fxBlended = texture2D(fxBlendingSrc, mix(vCoverUv, vec2(blendingDst.g), uvBlending));
vec4 alphaBlended = mix(blendingDst, fxBlended,fxBlended.a * alphaBlending);

blendingDst = alphaBlended;