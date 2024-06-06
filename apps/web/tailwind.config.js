/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",

		// Or if using `src` directory:
		"./src/**/*.{js,ts,jsx,tsx,mdx}"
	],
	theme: {
		extend: {
			colors: {
				// blue1: "#D0EBFF",
				// blue6: "#228BE6",
				// gray2: "#E9ECEF",
				// gray4: "#CED4DA",
				// gray5: "#ADB5BD",
				// gray6: "#868E96",
				// gray7: "#495057",
				// dark3: "#5C5F66",
				// dark4: "#373A40",
				// dark5: "#2C2E33"
				// Color keys are direct mapped from Figma Color Library used in Course Compose project.
				// https://www.figma.com/file/PXPMF9wEKCCGy8x1t0DVPJ/Course-Compose?type=design&node-id=123-1049&mode=design&t=DKyRwf9n5wg79PeP-0
			}, 
		}
	},
	plugins: [],
	corePlugins: {
		// Disable preflight to get rid of base styles
		preflight: false
	}
};
