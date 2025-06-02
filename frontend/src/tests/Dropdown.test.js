import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dropdown, { DropdownItem, DropdownDivider, DropdownHeader } from '../components/common/Dropdown';

describe('Dropdown Component', () => {
  const defaultProps = {
    trigger: <button>Open Menu</button>,
    children: (
      <>
        <DropdownItem onClick={() => {}}>Item 1</DropdownItem>
        <DropdownItem onClick={() => {}}>Item 2</DropdownItem>
        <DropdownDivider />
        <DropdownItem onClick={() => {}} variant="danger">Delete</DropdownItem>
      </>
    ),
  };

  it('renders trigger element', () => {
    render(<Dropdown {...defaultProps} />);
    expect(screen.getByText('Open Menu')).toBeInTheDocument();
  });

  it('opens dropdown when trigger is clicked', () => {
    render(<Dropdown {...defaultProps} />);
    
    const trigger = screen.getByText('Open Menu');
    fireEvent.click(trigger);
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', async () => {
    render(<Dropdown {...defaultProps} />);
    
    // Open dropdown
    const trigger = screen.getByText('Open Menu');
    fireEvent.click(trigger);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    });
  });

  it('closes dropdown when escape key is pressed', async () => {
    render(<Dropdown {...defaultProps} />);
    
    // Open dropdown
    const trigger = screen.getByText('Open Menu');
    fireEvent.click(trigger);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    
    // Press escape
    fireEvent.keyDown(document, { key: 'Escape' });
    
    await waitFor(() => {
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    });
  });

  it('closes dropdown when item is clicked (default behavior)', async () => {
    const onItemClick = vi.fn();
    render(
      <Dropdown
        trigger={<button>Open Menu</button>}
        children={<DropdownItem onClick={onItemClick}>Item 1</DropdownItem>}
      />
    );
    
    // Open dropdown
    const trigger = screen.getByText('Open Menu');
    fireEvent.click(trigger);
    
    // Click item
    const item = screen.getByText('Item 1');
    fireEvent.click(item);
    
    expect(onItemClick).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    });
  });

  it('supports controlled state', () => {
    const onToggle = vi.fn();
    render(
      <Dropdown
        {...defaultProps}
        isOpen={true}
        onToggle={onToggle}
      />
    );
    
    // Should be open initially
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    
    // Click trigger should call onToggle
    const trigger = screen.getByText('Open Menu');
    fireEvent.click(trigger);
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('supports different placements', () => {
    const { rerender } = render(
      <Dropdown {...defaultProps} placement="top-left" />
    );
    
    const trigger = screen.getByText('Open Menu');
    fireEvent.click(trigger);
    
    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('bottom-full', 'left-0');
    
    // Test another placement
    rerender(<Dropdown {...defaultProps} placement="bottom-right" />);
    fireEvent.click(trigger);
    
    expect(menu).toHaveClass('top-full', 'right-0');
  });

  it('handles disabled state', () => {
    render(<Dropdown {...defaultProps} disabled={true} />);
    
    const trigger = screen.getByText('Open Menu');
    fireEvent.click(trigger);
    
    // Should not open when disabled
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('supports keyboard navigation', () => {
    render(<Dropdown {...defaultProps} />);
    
    const trigger = screen.getByText('Open Menu');
    
    // Open with Enter key
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    
    // Close with Escape
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    
    // Open with Space key
    fireEvent.keyDown(trigger, { key: ' ' });
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });
});

describe('DropdownItem Component', () => {
  it('renders with default variant', () => {
    render(<DropdownItem onClick={() => {}}>Test Item</DropdownItem>);
    
    const item = screen.getByText('Test Item');
    expect(item).toHaveClass('text-gray-700', 'hover:bg-gray-100');
  });

  it('renders with danger variant', () => {
    render(<DropdownItem onClick={() => {}} variant="danger">Delete</DropdownItem>);
    
    const item = screen.getByText('Delete');
    expect(item).toHaveClass('text-red-600', 'hover:bg-red-50');
  });

  it('renders with primary variant', () => {
    render(<DropdownItem onClick={() => {}} variant="primary">Primary Action</DropdownItem>);
    
    const item = screen.getByText('Primary Action');
    expect(item).toHaveClass('text-blue-600', 'hover:bg-blue-50');
  });

  it('handles disabled state', () => {
    const onClick = vi.fn();
    render(<DropdownItem onClick={onClick} disabled={true}>Disabled Item</DropdownItem>);
    
    const item = screen.getByText('Disabled Item');
    expect(item).toHaveClass('opacity-50', 'cursor-not-allowed');
    expect(item).toBeDisabled();
    
    fireEvent.click(item);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('DropdownDivider Component', () => {
  it('renders divider', () => {
    render(<DropdownDivider />);
    
    const divider = screen.getByRole('separator');
    expect(divider).toHaveClass('border-t', 'border-gray-200');
  });
});

describe('DropdownHeader Component', () => {
  it('renders header text', () => {
    render(<DropdownHeader>Section Header</DropdownHeader>);
    
    const header = screen.getByText('Section Header');
    expect(header).toHaveClass('text-xs', 'font-semibold', 'text-gray-500', 'uppercase');
  });
});
