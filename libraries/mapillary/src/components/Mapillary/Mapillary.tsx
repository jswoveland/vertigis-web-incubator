import type { LayoutElementProperties } from "@vertigis/web/components";
import { LayoutElement } from "@vertigis/web/components";
import ButtonGroup from "@vertigis/web/ui/ButtonGroup";
import IconButton from "@vertigis/web/ui/IconButton";
// Import the necessary CSS for the Mapillary viewer to be styled correctly.
import "mapillary-js/dist/mapillary.css";
import "./Mapillary.css";
import { useWatchAndRerender } from "@vertigis/web/ui/hooks";
import CenterMap from "@vertigis/web/ui/icons/CenterMap";
import MapSyncOff from "@vertigis/web/ui/icons/MapSyncOff";
import MapSyncOn from "@vertigis/web/ui/icons/MapSyncOn";
import clsx from "clsx";
import { Viewer, TransitionMode } from "mapillary-js";
import type { ReactElement } from "react";
import { useEffect, useRef } from "react";

import type MapillaryModel from "./MapillaryModel";

export default function Mapillary(
    props: LayoutElementProperties<MapillaryModel>
): ReactElement {
    const { model } = props;
    const mlyRootEl = useRef<HTMLDivElement>();
    // const imageId = "2935399116683438";
    const onSyncToggle = () =>
        (model.synchronizePosition = !model.synchronizePosition);
    const onRecenter = () => model.recenter();

    useWatchAndRerender(model, "synchronizePosition");

    useEffect(() => {
        const mapillary = new Viewer({
            imageId: null,
            container: mlyRootEl.current,
            accessToken: model.mapillaryKey,
            component: {
                // Initialize the view immediately without user interaction.
                cover: false,
            },
        });
        mapillary.setTransitionMode(TransitionMode.Instantaneous);
        model.mapillary = mapillary;

        const handleViewportResize = () => {
            mapillary.resize();
        };

        // Viewer size is dynamic so resize should be called every time the viewport size changes.
        const resizeObserver = new ResizeObserver(handleViewportResize);
        const viewportDiv = mlyRootEl.current;
        resizeObserver.observe(viewportDiv);

        // These handlers are necessary as Mapillary cannot handle the many
        // update events caused by dragging the location marker. We'll only
        // handle the last one fired when the mouse button is released.
        // const mouseDownHandler = (): void =>
        //     (model.currentMarkerPosition = undefined);
        // const mouseUpHandler = (): void => {
        //     if (
        //         model.mapillary?.isNavigable &&
        //         !model.updating &&
        //         model.currentMarkerPosition
        //     ) {
        //         model.updating = true;

        //         const { latitude, longitude } = model.currentMarkerPosition;
        //         model.currentMarkerPosition = undefined;
        //         // See comment in MapillaryModel.ts
        //         // eslint-disable-next-line no-void
        //         void  model.moveCloseToPosition(latitude, longitude);
        //     }
        // };
        // document.body.addEventListener("mousedown", mouseDownHandler);
        // document.body.addEventListener("mouseup", mouseUpHandler);

        // Clean up when this component is unmounted from the DOM.
        return () => {
            // Remove listeners.
            // document.body.removeEventListener("mousedown", mouseDownHandler);
            //    document.body.removeEventListener("mouseup", mouseUpHandler);
            resizeObserver.unobserve(viewportDiv);

            // Clear out the Mapillary instance property. This will take care of
            // cleaning up.
            model.mapillary = undefined;
        };
    }, [model, model.id, model.mapillaryKey]);

    return (
        <LayoutElement {...props} stretch>
            <div ref={mlyRootEl} className="mapillary-map-container" />
            <div>
                <ButtonGroup className="third-party-map-controls" size="small">
                    <IconButton
                        className={clsx({
                            selected: model.synchronizePosition,
                        })}
                        onClick={onSyncToggle}
                        title={
                            model.synchronizePosition
                                ? "language-web-incubator-mapillary-disable-sync-title"
                                : "language-web-incubator-mapillary-enable-sync-title"
                        }
                    >
                        {model.synchronizePosition ? (
                            <MapSyncOn />
                        ) : (
                            <MapSyncOff />
                        )}
                    </IconButton>
                    <IconButton
                        onClick={onRecenter}
                        title={
                            "language-web-incubator-mapillary-recenter-title"
                        }
                    >
                        <CenterMap />
                    </IconButton>
                </ButtonGroup>
            </div>
        </LayoutElement>
    );
}
