# Org Emacs Export For VSCode

Offers native emacs org-mode org-*-export-to-* functions (except org-org-export-to-org)
This export functions need emacs installed to work.

I does not test it on Windows or Mac !

List of new commands:

+  org.asciiExportToAscii
+  org.beamerExportToLatex
+  org.beamerExportToPdf
+  org.htmlExportToHtml
+  org.icalendarExportToIcs
+  org.latexExportToLatex
+  org.latexExportToPdf
+  org.mdExportToMarkdown
+  org.odtExportToOdt


# Notes

my cmdPattern: 
```
emacs -Q --batch' +
' --eval "(require \'org)"' +
' --eval \'(setq org-latex-pdf-process (quote ("lualatex --draftmode --interaction=nonstopmode    --output-directory=%%o %%f" "lualatex --draftmode --interaction=nonstopmode --output-directory=%%o %%f" "lualatex --interaction=nonstopmode -shell-escape --output-directory=%%o %%f")))\'' +
' --eval "(setq org-latex-listings \'minted)"' +
' --eval "(setq org-confirm-babel-evaluate nil)"' +
' --eval "(org-babel-do-load-languages \'org-babel-load-languages \'((plantuml . t)))"' +
' --eval "(setq org-plantuml-jar-path (expand-file-name \\"/opt/plantuml.jar\\"))"' +
' --visit="%s"'+
' --funcall %s;
```