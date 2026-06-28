import {
    Capability,
    CleanRoute,
    useCleanRouteControlPropertiesQuery,
    useCleanRouteMutation,
    useCleanRouteQuery,
} from "../api";
import {useCapabilitiesSupported} from "../CapabilitiesProvider";
import {
    Box,
    Grid2,
    Icon,
    Paper,
    Typography
} from "@mui/material";
import {
    Route as CleanRouteControlIcon,
    ExpandMore as OpenIcon,
    ExpandLess as CloseIcon,
    CleaningServices as CleaningOptionsIcon
} from "@mui/icons-material";
import React from "react";
import {SelectListMenuItem, SelectListMenuItemOption} from "../components/list_menu/SelectListMenuItem";
import {ListMenu} from "../components/list_menu/ListMenu";

const CleanRouteControlCapabilitySelectListMenuItem = () => {
    const SORT_ORDER = {
        "quick": 1,
        "normal": 2,
        "intensive": 3,
        "deep": 4
    };

    const {
        data: cleanRouteControlProperties,
        isPending: cleanRouteControlPropertiesPending,
        isError: cleanRouteControlPropertiesError
    } = useCleanRouteControlPropertiesQuery();

    const options: Array<SelectListMenuItemOption> = (
        cleanRouteControlProperties?.supportedRoutes ?? []
    ).sort((a, b) => {
        const aMapped = SORT_ORDER[a] ?? 10;
        const bMapped = SORT_ORDER[b] ?? 10;

        if (aMapped < bMapped) {
            return -1;
        } else if (bMapped < aMapped) {
            return 1;
        } else {
            return 0;
        }
    }).map((val: CleanRoute) => {
        let label;

        switch (val) {
            case "quick":
                label = "Quick";
                break;
            case "normal":
                label = "Normal";
                break;
            case "intensive":
                label = "Intensive";
                break;
            case "deep":
                label = "Deep";
                break;
        }

        return {
            value: val,
            label: label
        };
    });

    const description = React.useMemo(() => {
        let desc = "Trade speed for thoroughness and vice-versa.";

        if (cleanRouteControlProperties) {
            if (cleanRouteControlProperties.mopOnly.length > 0) {
                const labels = cleanRouteControlProperties.mopOnly.map(route => {
                    const label = options.find(o => o.value === route)?.label ?? "unknown";

                    return `"${label}"`;
                });

                desc += ` ${labels.join(", ")} only ${labels.length > 1 ? "apply" : "applies"} when mopping.`;
            }

            if (cleanRouteControlProperties.oneTime.length > 0) {
                const labels = cleanRouteControlProperties.oneTime.map(route => {
                    const label = options.find(o => o.value === route)?.label ?? "unknown";

                    return `"${label}"`;
                });

                desc += ` ${labels.join(", ")} ${labels.length > 1 ? "are" : "is"} one-time only.`;
            }
        }

        return desc;
    }, [cleanRouteControlProperties, options]);


    const {
        data: data,
        isPending: isPending,
        isFetching: isFetching,
        isError: isError,
    } = useCleanRouteQuery();

    const {mutate: mutate, isPending: isChanging} = useCleanRouteMutation();
    const loading = isFetching || isChanging;
    const disabled = loading || isChanging || isError;

    const currentValue = options.find(mode => {
        return mode.value === data;
    }) ?? {value: "", label: ""};


    return (
        <SelectListMenuItem
            options={options}
            currentValue={currentValue}
            setValue={(e) => {
                mutate(e.value as CleanRoute);
            }}
            disabled={disabled}
            loadingOptions={cleanRouteControlPropertiesPending || isPending}
            loadError={cleanRouteControlPropertiesError}
            primaryLabel="Clean Route"
            secondaryLabel={description}
            icon={<CleanRouteControlIcon/>}
        />
    );
};

const CleaningOptions = (): React.ReactElement => {
    const [expanded, setExpanded] = React.useState<boolean>(false);

    const [cleanRouteControlSupported] = useCapabilitiesSupported(Capability.CleanRouteControl);

    if (!cleanRouteControlSupported) {
        return <></>;
    }

    return (
        <Grid2>
            <Paper sx={{minHeight: "2.5em"}}>
                <Grid2 container direction="column">
                    <Box px={1.5} pt={1}>
                        <Grid2
                            container
                            alignItems="center"
                            spacing={1}
                            onClick={() => {
                                setExpanded(!expanded);
                            }}
                            style={{cursor: "pointer", paddingBottom: expanded ? "0" : "8px"}}
                        >
                            <Grid2><CleaningOptionsIcon fontSize="small" sx={{ marginTop: "4px" }} /></Grid2>
                            <Grid2 sx={{marginTop: "-8px" /* ugh */}}>
                                <Typography variant="subtitle1">
                                    Cleaning Options
                                </Typography>
                            </Grid2>
                            <Grid2
                                sx={{
                                    marginLeft: "auto"
                                }}
                            >
                                <Icon component={expanded ? CloseIcon : OpenIcon}/>
                            </Grid2>
                        </Grid2>
                        <Grid2 sx={{
                            display: expanded ? "inherit" : "none",
                            paddingBottom: "8px"
                        }}>
                            <ListMenu
                                primaryHeader=""
                                secondaryHeader=""
                                listItems={[
                                    ...(cleanRouteControlSupported ? [<CleanRouteControlCapabilitySelectListMenuItem key="cleanRoute" />] : [])
                                ]}
                            />
                        </Grid2>
                    </Box>
                </Grid2>
            </Paper>
        </Grid2>
    );
};

export default CleaningOptions;
