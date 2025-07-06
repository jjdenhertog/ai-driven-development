#!/bin/bash

# PRPS Agentic Engineering Installation Script
# This script installs the PRPS Agentic Engineering tools into your existing project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to get user input for yes/no questions
ask_yes_no() {
    local question="$1"
    local default="$2"
    local answer
    
    while true; do
        if [[ "$default" == "y" ]]; then
            read -p "$question [Y/n]: " answer
            answer=${answer:-y}
        else
            read -p "$question [y/N]: " answer
            answer=${answer:-n}
        fi
        
        case $answer in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

# Function to handle file conflicts
handle_file_conflict() {
    local source_file="$1"
    local target_file="$2"
    local relative_path="$3"
    
    print_warning "File conflict detected: $relative_path"
    echo "  Source: $source_file"
    echo "  Target: $target_file"
    echo ""
    echo "Choose an option:"
    echo "1) Overwrite the existing file"
    echo "2) Keep both (rename new file with _new suffix)"
    echo "3) Skip this file"
    echo ""
    
    while true; do
        read -p "Enter your choice [1-3]: " choice
        case $choice in
            1)
                print_info "Overwriting $target_file"
                cp "$source_file" "$target_file"
                return 0
                ;;
            2)
                local new_name="${target_file%.*}_new.${target_file##*.}"
                # Handle files without extensions
                if [[ "$target_file" == "$new_name" ]]; then
                    new_name="${target_file}_new"
                fi
                print_info "Copying to $new_name"
                cp "$source_file" "$new_name"
                return 0
                ;;
            3)
                print_info "Skipping $relative_path"
                return 1
                ;;
            *)
                echo "Please enter 1, 2, or 3."
                ;;
        esac
    done
}

# Function to copy specific directories and files with conflict handling
copy_specific_items() {
    local source_dir="$1"
    local target_dir="$2"
    local files_copied=0
    local files_skipped=0
    
    # Define specific items to copy
    local items_to_copy=(".claude" "examples" "PROMPTS" "PRPs" "CLAUDE.md")
    
    for item in "${items_to_copy[@]}"; do
        local source_item="$source_dir/$item"
        local target_item="$target_dir/$item"
        
        # Skip if source item doesn't exist
        if [[ ! -e "$source_item" ]]; then
            print_warning "Source item not found: $item"
            continue
        fi
        
        # Handle directories
        if [[ -d "$source_item" ]]; then
            if [[ -d "$target_item" ]]; then
                # Target directory exists, handle conflicts for each file inside
                print_warning "Directory $item already exists in target"
                if ask_yes_no "Merge contents of $item directory?" "y"; then
                    # Copy files from source directory to target, handling conflicts
                    copy_directory_contents "$source_item" "$target_item" "$item"
                else
                    print_info "Skipping directory $item"
                    ((files_skipped++))
                fi
            else
                # Target directory doesn't exist, copy entire directory
                print_info "Copying directory $item"
                cp -r "$source_item" "$target_item"
                ((files_copied++))
            fi
        # Handle files
        elif [[ -f "$source_item" ]]; then
            if [[ -f "$target_item" ]]; then
                if handle_file_conflict "$source_item" "$target_item" "$item"; then
                    ((files_copied++))
                else
                    ((files_skipped++))
                fi
            else
                print_info "Copying file $item"
                cp "$source_item" "$target_item"
                ((files_copied++))
            fi
        fi
    done
    
    print_success "Items copied: $files_copied"
    if [[ $files_skipped -gt 0 ]]; then
        print_warning "Items skipped: $files_skipped"
    fi
}

# Function to copy directory contents with conflict handling
copy_directory_contents() {
    local source_dir="$1"
    local target_dir="$2"
    local dir_name="$3"
    
    # Ensure target directory exists
    mkdir -p "$target_dir"
    
    # Find all files in source directory
    while IFS= read -r -d '' file; do
        # Get relative path from source directory
        local rel_path="${file#$source_dir/}"
        local target_file="$target_dir/$rel_path"
        local target_parent="$(dirname "$target_file")"
        
        # Create target directory if it doesn't exist
        mkdir -p "$target_parent"
        
        # Check if target file exists
        if [[ -f "$target_file" ]]; then
            if ! handle_file_conflict "$file" "$target_file" "$dir_name/$rel_path"; then
                continue
            fi
        else
            print_info "Copying $dir_name/$rel_path"
            cp "$file" "$target_file"
        fi
    done < <(find "$source_dir" -type f -print0)
}

# Main installation function
main() {
    print_info "PRPS Agentic Engineering (Nextjs) Installation Script"
    print_info "==========================================="
    echo ""
    
    # Get the directory where this script is located
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Step 1: Make all .sh files executable
    print_info "Step 1: Making all .sh files executable..."
    local sh_files_count=0
    
    while IFS= read -r -d '' file; do
        chmod +x "$file"
        print_info "Made executable: ${file#$SCRIPT_DIR/}"
        ((sh_files_count++))
    done < <(find "$SCRIPT_DIR" -name "*.sh" -type f -print0)
    
    if [[ $sh_files_count -eq 0 ]]; then
        print_warning "No .sh files found to make executable"
    else
        print_success "Made $sh_files_count shell script(s) executable"
    fi
    echo ""
    
    # Step 2: Get target directory
    print_info "Step 2: Specify target directory"
    echo "Enter the path to your existing project directory where you want to install these tools:"
    
    while true; do
        read -p "Target directory: " target_dir
        
        # Expand tilde and relative paths
        target_dir="${target_dir/#\~/$HOME}"
        target_dir="$(realpath "$target_dir" 2>/dev/null || echo "$target_dir")"
        
        if [[ -z "$target_dir" ]]; then
            print_error "Please enter a directory path"
            continue
        fi
        
        if [[ ! -d "$target_dir" ]]; then
            if ask_yes_no "Directory $target_dir does not exist. Create it?" "n"; then
                mkdir -p "$target_dir"
                print_success "Created directory: $target_dir"
                break
            else
                print_info "Please enter an existing directory path"
                continue
            fi
        else
            print_success "Target directory: $target_dir"
            break
        fi
    done
    echo ""
    
    # Step 3: Confirm installation
    print_info "Step 3: Confirm installation"
    echo "Source directory: $SCRIPT_DIR"
    echo "Target directory: $target_dir"
    echo ""
    
    if ! ask_yes_no "Proceed with installation?" "y"; then
        print_info "Installation cancelled"
        exit 0
    fi
    echo ""
    
    # Step 4: Copy specific items
    print_info "Step 4: Copying PRPS tools..."
    copy_specific_items "$SCRIPT_DIR" "$target_dir"
    echo ""
    
    # Step 5: Final steps
    print_info "Step 5: Final setup"
    
    # Make shell scripts executable in the target directory as well
    local target_sh_count=0
    while IFS= read -r -d '' file; do
        chmod +x "$file"
        ((target_sh_count++))
    done < <(find "$target_dir" -name "*.sh" -type f -print0 2>/dev/null)
    
    if [[ $target_sh_count -gt 0 ]]; then
        print_success "Made $target_sh_count shell script(s) executable in target directory"
    fi
    
    echo ""
    print_success "Installation completed successfully!"
    print_info "Your PRPS Agentic Engineering tools have been installed to: $target_dir"
    
    # Check for README or setup instructions
    if [[ -f "$target_dir/README.md" ]]; then
        print_info "Please check the README.md file for setup and usage instructions"
    fi
    
    if [[ -f "$target_dir/CLAUDE.md" ]]; then
        print_info "Please check the CLAUDE.md file for Claude-specific instructions"
    fi
}

# Check if script is being run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi