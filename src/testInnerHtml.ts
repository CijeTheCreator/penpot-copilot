export const testHtml = `
<body class="dark"><style type="text/css">
                        html:before {
                            z-index: -2147483646;
                        }
        html:before {
            background: rgba(255,0,0,1);
            opacity: 0.75;
            transition:  opacity 0.85s ease-out;
            position: fixed;
            content: "";
            z-index: 2147483647;
            top: 0;
            left: 0;
            height: 2px;
        }</style>
    <div id="root"><div class="flex flex-col gap-4 items-center p-4 dark"><section aria-label="Notifications alt+T" tabindex="-1" aria-live="polite" aria-relevant="additions text" aria-atomic="false"></section><div class="flex flex-col gap-4 items-center p-4 dark w-full h-full"><div>Plugin</div></div></div></div>
  

</body>
`;
