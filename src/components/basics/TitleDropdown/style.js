export default {
  buttonText: {
    color: 'palette.color-black-1',
  },
  caretContainer: {
    // marginLeft: 10,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'palette.color-white-3',
    borderColor: 'palette.color-grey-6',
    borderWidth: 1,
    borderRadius: 6,
  },
  dropdownStyle: {
    borderRadius: 4,
    shadowColor: 'palette.color-dynamic-shadow',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
    padding: 8,
  },
  defaultItem: {
    backgroundColor: 'dropdown.dropdown-item-background-color',
    justifyContent: 'center',
    alignItems: 'flex-start',
    // paddingVertical: 'dropdown.dropdown-item-padding-vertical',
    paddingHorizontal: 'dropdown.dropdown-item-padding-horizontal',
    height: 'dropdown.dropdown-default-min-height',
  },
  selectedItem: {
    backgroundColor: 'dropdown.dropdown-item-selected-background-color',
    borderRadius: 'dropdown.dropdown-item-selected-border-radius',
  },
  defaultText: {
    color: 'dropdown.dropdown-item-text-color',
    fontSize: 'dropdown.dropdown-item-font-size',
    fontWeight: 'dropdown.dropdown-item-font-weight',
    fontFamily: 'dropdown.dropdown-item-font-family',
    lineHeight: 'dropdown.dropdown-item-line-height',
  },
  selectedText: {
    color: 'dropdown.dropdown-item-selected-text-color',
  },
  separator: {
    height: 2,
  },
};
