import React from 'react';
import { render, screen } from '@testing-library/react';
import { Layout, MainContent, Container, Grid, Flex } from '../Layout';

describe('Layout Components', () => {
  describe('Layout', () => {
    it('renders children correctly', () => {
      render(
        <Layout>
          <div>Test content</div>
        </Layout>
      );
      
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('applies default classes', () => {
      const { container } = render(
        <Layout>
          <div>Test</div>
        </Layout>
      );
      
      const layout = container.firstChild;
      expect(layout).toHaveClass('min-h-screen', 'bg-background', 'flex', 'flex-col');
    });

    it('applies custom className', () => {
      const { container } = render(
        <Layout className="custom-class">
          <div>Test</div>
        </Layout>
      );
      
      const layout = container.firstChild;
      expect(layout).toHaveClass('custom-class');
    });
  });

  describe('MainContent', () => {
    it('renders children correctly', () => {
      render(
        <MainContent>
          <div>Main content</div>
        </MainContent>
      );
      
      expect(screen.getByText('Main content')).toBeInTheDocument();
    });

    it('applies default classes', () => {
      const { container } = render(
        <MainContent>
          <div>Test</div>
        </MainContent>
      );
      
      const main = container.firstChild;
      expect(main).toHaveClass('flex-1', 'flex', 'flex-col');
    });
  });

  describe('Container', () => {
    it('renders with default size', () => {
      const { container } = render(
        <Container>
          <div>Container content</div>
        </Container>
      );
      
      const containerEl = container.firstChild;
      expect(containerEl).toHaveClass('max-w-full');
    });

    it('applies different sizes correctly', () => {
      const { rerender, container } = render(
        <Container size="sm">
          <div>Test</div>
        </Container>
      );
      
      expect(container.firstChild).toHaveClass('max-w-sm');
      
      rerender(
        <Container size="md">
          <div>Test</div>
        </Container>
      );
      
      expect(container.firstChild).toHaveClass('max-w-md');
    });
  });

  describe('Grid', () => {
    it('renders with default single column', () => {
      const { container } = render(
        <Grid>
          <div>Grid item</div>
        </Grid>
      );
      
      const grid = container.firstChild;
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'gap-4');
    });

    it('applies different column counts', () => {
      const { rerender, container } = render(
        <Grid cols={2}>
          <div>Item 1</div>
          <div>Item 2</div>
        </Grid>
      );
      
      expect(container.firstChild).toHaveClass('grid-cols-1', 'sm:grid-cols-2');
      
      rerender(
        <Grid cols={3}>
          <div>Item 1</div>
        </Grid>
      );
      
      expect(container.firstChild).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
    });

    it('applies different gap sizes', () => {
      const { rerender, container } = render(
        <Grid gap="sm">
          <div>Item</div>
        </Grid>
      );
      
      expect(container.firstChild).toHaveClass('gap-2');
      
      rerender(
        <Grid gap="lg">
          <div>Item</div>
        </Grid>
      );
      
      expect(container.firstChild).toHaveClass('gap-6');
    });
  });

  describe('Flex', () => {
    it('renders with default flex properties', () => {
      const { container } = render(
        <Flex>
          <div>Flex item</div>
        </Flex>
      );
      
      const flex = container.firstChild;
      expect(flex).toHaveClass('flex', 'flex-row', 'items-start', 'justify-start', 'gap-4');
    });

    it('applies different directions', () => {
      const { rerender, container } = render(
        <Flex direction="col">
          <div>Item</div>
        </Flex>
      );
      
      expect(container.firstChild).toHaveClass('flex-col');
      
      rerender(
        <Flex direction="row">
          <div>Item</div>
        </Flex>
      );
      
      expect(container.firstChild).toHaveClass('flex-row');
    });

    it('applies different alignment options', () => {
      const { rerender, container } = render(
        <Flex align="center" justify="between">
          <div>Item</div>
        </Flex>
      );
      
      expect(container.firstChild).toHaveClass('items-center', 'justify-between');
      
      rerender(
        <Flex align="end" justify="center">
          <div>Item</div>
        </Flex>
      );
      
      expect(container.firstChild).toHaveClass('items-end', 'justify-center');
    });

    it('applies wrap when specified', () => {
      const { container } = render(
        <Flex wrap={true}>
          <div>Item</div>
        </Flex>
      );
      
      expect(container.firstChild).toHaveClass('flex-wrap');
    });

    it('applies custom className', () => {
      const { container } = render(
        <Flex className="custom-flex">
          <div>Item</div>
        </Flex>
      );
      
      expect(container.firstChild).toHaveClass('custom-flex');
    });
  });
});