@REM python manage.py graph_models -a --arrow-shape normal -g --color-code-deletions -o graphs\grouped-appviz.png
@REM python manage.py graph_models -a --arrow-shape normal --color-code-deletions --rankdir BT -o graphs\ungrouped-appviz.png
@REM python manage.py graph_models -a -d --arrow-shape normal -o graphs\nofields.png
@REM python manage.py graph_models -a -g -d --arrow-shape normal -o graphs\nofields_grouped.png
@REM python manage.py graph_models -a -g -d --arrow-shape crow -l circo -o graphs\nofields_crowcirco.png
@REM python manage.py graph_models -a -g -d --arrow-shape none --disable-abstract-fields --color-code-deletions -l dot -o graphs\nofields_dotcolored.png
@REM python manage.py graph_models -a -g -d --arrow-shape icurve -l dot -o graphs\nofields_curvedot.png
@REM python manage.py graph_models -a -g -d --hide-edge-labels --arrow-shape diamond -l dot -o graphs\nofields_diamondot.png
@REM python manage.py graph_models -a -g -d --hide-edge-labels --arrow-shape none --dot -o graphs\nofields.dot

@REM python manage.py graph_models -g -X exclude.models -d --rankdir TB --hide-edge-labels --no-inheritance --arrow-shape none --color-code-deletions -l dot -o graphs\minimal-updated.png shop accounts
@REM python manage.py graph_models -g -X exclude.models -d --rankdir LR --hide-edge-labels --no-inheritance --arrow-shape none --color-code-deletions -l circo -o graphs\minimal-circo.png shop accounts
python manage.py graph_models -g -X exclude.models -d --rankdir TB --hide-edge-labels --no-inheritance --arrow-shape none --color-code-deletions --dot -o graphs\minimal-zen.dot shop accounts