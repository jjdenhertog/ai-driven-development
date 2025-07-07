# Nexrender Job Configuration Specification

This document defines the exact structure and requirements for creating nexrender jobs in the After Effects Render Manager system. More detailed explanation about rendering jobs using nexrender can be found at https://github.com/inlife/nexrender

## 1. Job Structure Overview

The system creates nexrender jobs with a configuration object alongside standard nexrender properties. Each job must follow this specific structure to ensure compatibility with the rendering pipeline.

### 1.1 Base Job Structure

Every job submitted to the system must contain:
- **template** - After Effects project configuration
- **assets** - Array of dynamic replacements (scripts, data)
- **actions** - Pre/post render actions (optional)
- **subtitles** - Subtitle configuration (optional)

## 2. Template Configuration

### 2.1 Required Template Fields

```json
{
  "template": {
    "src": "file:///C:/Users/[username]/Dropbox/path/to/template.aep",
    "composition": "CompositionName",
    "outputModule": "video | static | some other output module template",
    "outputExt": "mp4 | jpg"
  }
}
```

### 2.2 Template Field Specifications

- **src**: 
  - Always use `file://` protocol
  - Must be absolute Windows path
  - Path must exist in Dropbox folder
  
- **composition**: 
  - Exact name from After Effects project
  - Common patterns: "16x9", "9x16", "1x1pl", dimension-based names
  
- **outputModule**:
  - "video" for video renders
  - "static" for static image renders
  - Must be pre-configured in After Effects
  
- **outputExt**:
  - "mp4" for video outputs
  - "jpg" for static image outputs
  
- **Optional fields**:
  - `frameStart`, `frameEnd` - For specific frame ranges
  - Not used: `continueOnMissing`, `settingsTemplate`, `renderSettings`

## 3. Configuration Object

### 3.1 Required Fields

```json
{
  "job": {
    "ame": false,
    "variant": "VariantName",
    "outputPath": "/Users/[username]/Dropbox/Exports/[filename].mp4",
    "type": "video | static",
    "queue": false,
    "markers": false,
    "skipRender": false
  }
}
```

### 3.2 Field Definitions

- **ame**: Boolean - Use Adobe Media Encoder for rendering
- **variant**: String - Variant identifier for visibility control
- **outputPath**: String - Full output path with placeholders
- **type**: "video" or "static" - Output type
- **queue**: Boolean - Queue in AME (when ame: true)
- **markers**: Boolean - Render markers as separate frames
- **skipRender**: Boolean - Test mode without actual rendering

### 3.3 Output Path Placeholders

The outputPath supports these dynamic placeholders:
- `[variant]` - Replaced with variant name
- `[width]` - Rendered composition width
- `[height]` - Rendered composition height
- `[frame]` - Frame number (for marker renders)
- `[compname]` - Composition name
- `[foldername]` - Folder template value
- `[folderlabel]` - Folder with `/` replaced by `_`

## 4. Asset Configuration

### 4.1 Script Assets

Script assets run ExtendScript files to modify the project before rendering.

#### Find and Replace Missing Files
```json
{
  "type": "script",
  "src": "file:///path/to/find-and-replace-missing.jsx",
  "parameters": [
    {
      "key": "username",
      "value": "macUsername"
    }
  ]
}
```

#### Variant Visibility Control
```json
{
  "type": "script",
  "src": "file:///path/to/variant-visibility.jsx",
  "parameters": [
    {
      "key": "variant",
      "value": "VariantName"
    }
  ]
}
```

#### Import Subtitles
```json
{
  "type": "script",
  "src": "file:///path/to/import-subtitles.jsx",
  "parameters": [
    {
      "key": "file",
      "value": "subtitles.srt"
    },
    {
      "key": "layer",
      "value": "SubtitleLayerName"
    },
    {
      "key": "valign",
      "value": "top | center | bottom"
    },
    {
      "key": "comp",
      "value": "CompositionName"
    },
    {
      "key": "hide_layers",
      "value": "Layer1,Layer2,Layer3"
    }
  ]
}
```

#### Render Markers
```json
{
  "type": "script",
  "src": "file:///path/to/render-markers.jsx",
  "parameters": [
    {
      "key": "OMTemplate",
      "value": "static"
    },
    {
      "key": "comp",
      "value": "CompositionName"
    },
    {
      "key": "outputFolder",
      "value": "/path/to/output"
    },
    {
      "key": "extension",
      "value": "jpg"
    }
  ]
}
```

#### Save Project
```json
{
  "type": "script",
  "src": "file:///path/to/save-aep.jsx"
}
```

### 4.2 Data Assets

Data assets replace text content in After Effects layers.

```json
{
  "type": "data",
  "layerName": "ExactLayerName",
  "property": "Source Text",
  "value": "Replacement Text"
}
```

#### Data Asset Rules:
- **type**: Always "data" for text replacement
- **layerName**: Must match exactly with AE layer name
- **property**: Always "Source Text" for text layers
- **value**: String value to replace
- No `src` field for data assets
- No `layerIndex` - always use layer names

### 4.3 Asset Order Requirements

1. **find-and-replace-missing.jsx** - Always first if used
2. **variant-visibility.jsx** - Before any content changes
3. **import-subtitles.jsx** - Before data replacements
4. **Data assets** - All text replacements
5. **save-aep.jsx** - Always last if saving project

## 5. Subtitle Configuration

### 5.1 Subtitle Object Structure

```json
{
  "subtitles": {
    "file": "filename.srt",
    "valign": "top | center | bottom",
    "values": [
      {
        "id": "1",
        "text": "Subtitle text line 1"
      },
      {
        "id": "2",
        "text": "Subtitle text line 2"
      }
    ],
    "layer": "SubtitleLayerName",
    "hideLayers": "Layer1,Layer2"
  }
}
```

### 5.2 Subtitle Rules

- Only one subtitle configuration per job
- SRT file must exist in project directory
- Values array replaces text in SRT by ID
- Layer name must exist in AE project
- hideLayers is comma-separated string

## 6. Actions Configuration

### 6.1 Prerender Actions

Currently, only one prerender action is used:

```json
{
  "actions": {
    "prerender": [
      {
        "module": "copy-and-convert-srt"
      }
    ]
  }
}
```

### 6.2 Action Notes

- No standard nexrender actions used (@nexrender/action-encode, etc.)
- Custom action handles SRT file processing
- Postrender actions not currently implemented
- No upload or copy actions needed

## 7. Complete Job Examples

### 7.1 Simple Text Replacement

```json
{
  "job": {
    "ame": false,
    "variant": "A",
    "outputPath": "C:\\Users\\username\\Dropbox\\Exports\\output_a.mp4",
    "type": "video",
    "queue": false,
    "markers": false,
    "skipRender": false
  },
  "template": {
    "src": "file:///C:/Users/username/Dropbox/Templates/template.aep",
    "composition": "16x9",
    "outputModule": "video",
    "outputExt": "mp4"
  },
  "assets": [
    {
      "type": "data",
      "layerName": "Title",
      "property": "Source Text",
      "value": "New Title Text"
    },
    {
      "type": "data",
      "layerName": "Subtitle",
      "property": "Source Text",
      "value": "New Subtitle"
    }
  ]
}
```

### 7.2 Complex Job with Scripts and Subtitles

```json
{
  "job": {
    "ame": false,
    "variant": "Premium",
    "outputPath": "C:\\Users\\username\\Dropbox\\Exports\\promo_[width]x[height].mp4",
    "type": "video",
    "queue": false,
    "markers": false,
    "skipRender": false
  },
  "template": {
    "src": "file:///C:/Users/username/Dropbox/Templates/promo.aep",
    "composition": "9x16",
    "outputModule": "video",
    "outputExt": "mp4"
  },
  "subtitles": {
    "file": "captions.srt",
    "valign": "bottom",
    "values": [
      {
        "id": "1",
        "text": "Limited Time Offer"
      },
      {
        "id": "2",
        "text": "50% Off Today"
      }
    ],
    "layer": "Captions",
    "hideLayers": "CaptionsAlt"
  },
  "assets": [
    {
      "type": "script",
      "src": "file:///C:/render-manager/plugins/find-and-replace-missing.jsx",
      "parameters": [
        {
          "key": "username",
          "value": "johndoe"
        }
      ]
    },
    {
      "type": "script",
      "src": "file:///C:/render-manager/plugins/variant-visibility.jsx",
      "parameters": [
        {
          "key": "variant",
          "value": "Premium"
        }
      ]
    },
    {
      "type": "script",
      "src": "file:///C:/render-manager/plugins/import-subtitles.jsx",
      "parameters": [
        {
          "key": "file",
          "value": "captions.srt"
        },
        {
          "key": "layer",
          "value": "Captions"
        },
        {
          "key": "valign",
          "value": "bottom"
        },
        {
          "key": "comp",
          "value": "9x16"
        },
        {
          "key": "hide_layers",
          "value": "CaptionsAlt"
        }
      ]
    },
    {
      "type": "data",
      "layerName": "ProductName",
      "property": "Source Text",
      "value": "Professional Monitor"
    },
    {
      "type": "data",
      "layerName": "Price",
      "property": "Source Text",
      "value": "$1,299"
    },
    {
      "type": "script",
      "src": "file:///C:/render-manager/plugins/save-aep.jsx"
    }
  ],
  "actions": {
    "prerender": [
      {
        "module": "copy-and-convert-srt"
      }
    ]
  }
}
```

## 8. Validation Requirements

### 8.1 Required Validations

Before accepting a job, validate:

1. **Template path exists** in Dropbox folder
2. **Composition name** is provided
3. **Output module** is either "video" or "static"
4. **Output extension** matches type (mp4 for video, jpg for static)
5. **All script paths** exist and are accessible
6. **Layer names** in data assets are non-empty
7. **Variant name** is provided in job config
8. **Output path** is valid Windows path

### 8.2 Path Conversion

When receiving jobs from macOS clients:
- Convert `/Users/username/` to `C:\Users\username\`
- Replace `/` with `\` in all paths
- Ensure Dropbox paths map correctly

### 8.3 Constraints

- All paths must be absolute (no relative paths)
- File protocol only (no http, s3, or data URIs)
- Maximum one subtitle configuration per job
- Text properties only support "Source Text"
- Scripts must use exact parameter keys shown

## 9. Error Scenarios

### 9.1 Common Errors to Handle

1. **Missing template file** - File doesn't exist in Dropbox
2. **Invalid composition** - Composition name not found in project
3. **Missing output module** - AE doesn't have required output module
4. **Script execution failure** - JSX script throws error
5. **Layer not found** - Data asset references non-existent layer
6. **Subtitle file missing** - SRT file not found
7. **Invalid path format** - Windows path validation fails

### 9.2 Error Responses

Each error should include:
- Specific error type
- Affected asset or configuration
- Suggestion for resolution
- Whether job can be retried

This specification provides complete guidance for creating and validating nexrender jobs compatible with the existing rendering pipeline.