import Script from "next/script";

export default function GoogleAnalytics() {
	return (
		<>
			<Script strategy="lazyOnload" async src="https://www.googletagmanager.com/gtag/js?id=G-FGMHLH99CQ"></Script>
			<Script id="" strategy="lazyOnload">
				{`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-FGMHLH99CQ', {
                  page_path: window.location.pathname,
                  });
                `}
			</Script>
		</>
	);
}
